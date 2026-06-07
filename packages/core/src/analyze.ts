import postcss, { type AcceptedPlugin } from "postcss";
import DoIUse from "doiuse/lib/DoIUse.js";
import browserslist from "browserslist";
import {
  type AnalyzeOptions,
  type CompatibilityReport,
  type FeatureFinding,
  type BrowserRef,
  type CssSource,
  DEFAULT_BROWSERSLIST,
  DEFAULT_THRESHOLDS,
} from "./types.js";
import { classifySeverity } from "./severity.js";
import { impactOf, IMPACT_WEIGHTS, isHidden } from "./impact.js";
import {
  missingDataToRefs,
  refsToBrowserslistTokens,
  browserName,
} from "./browsers.js";

interface RawUsage {
  feature: string;
  featureData: {
    title?: string;
    missingData?: Record<string, Record<string, string>>;
  };
  origin: string;
  line?: number;
  column?: number;
}

function resolveTargets(query: string | string[]): BrowserRef[] {
  return browserslist(query).map((token) => {
    const [id, version] = token.split(" ");
    return { id, name: browserName(id), version };
  });
}

function affectedUsageFor(missingRefs: BrowserRef[]): number {
  if (missingRefs.length === 0) return 0;
  try {
    return browserslist.coverage(refsToBrowserslistTokens(missingRefs));
  } catch {
    return 0;
  }
}

export async function analyzeCss(
  sources: CssSource[],
  options: AnalyzeOptions = {},
): Promise<CompatibilityReport> {
  const query = options.browserslist ?? DEFAULT_BROWSERSLIST;
  const thresholds = options.severityThresholds ?? DEFAULT_THRESHOLDS;
  const targetBrowsers = resolveTargets(query);

  const raw: RawUsage[] = [];
  for (const source of sources) {
    const collected: RawUsage[] = [];
    const plugin = new DoIUse({
      browsers: Array.isArray(query) ? query : [query],
      onFeatureUsage: (info: unknown) => {
        const u = info as {
          feature: string;
          featureData?: RawUsage["featureData"];
          usage?: { source?: { start?: { line?: number; column?: number } } };
        };
        // Skip features in the hidden (`none`) impact tier — gaps that degrade
        // gracefully with no visible signal (e.g. font-family value keywords).
        // Reporting them would be a false positive. See impact.ts.
        if (isHidden(u.feature)) return;
        collected.push({
          feature: u.feature,
          featureData: u.featureData ?? {},
          origin: source.origin,
          line: u.usage?.source?.start?.line,
          column: u.usage?.source?.start?.column,
        });
      },
    }) as unknown as AcceptedPlugin;
    await postcss([plugin]).process(source.css, { from: source.origin });
    raw.push(...collected);
  }

  // Group by featureId, merge occurrences and missing browsers.
  const byFeature = new Map<string, FeatureFinding>();
  for (const u of raw) {
    const missingIn = missingDataToRefs(u.featureData.missingData ?? {});
    const affectedUsage = affectedUsageFor(missingIn);
    const existing = byFeature.get(u.feature);
    if (existing) {
      existing.occurrences.push({
        origin: u.origin,
        line: u.line,
        column: u.column,
      });
    } else {
      // Severity weighs usage share against breakage impact: a cosmetic gap on a
      // high-share browser (e.g. resize on iOS Safari) must not outrank a
      // layout-breaking one. See impact.ts.
      const impact = impactOf(u.feature);
      const effective = affectedUsage * IMPACT_WEIGHTS[impact];
      byFeature.set(u.feature, {
        featureId: u.feature,
        title: u.featureData.title ?? u.feature,
        impact,
        severity: classifySeverity(effective, thresholds),
        affectedUsage: Number(affectedUsage.toFixed(2)),
        missingIn,
        occurrences: [{ origin: u.origin, line: u.line, column: u.column }],
      });
    }
  }
  const features = [...byFeature.values()].sort(
    (a, b) => b.affectedUsage - a.affectedUsage,
  );

  // Per-browser support, weighted by impact: a browser that only misses
  // cosmetic features barely loses support, while a missing breaking feature
  // counts in full. unsupportedFeatures stays a raw count for display.
  const totalWeight =
    features.reduce((sum, f) => sum + IMPACT_WEIGHTS[f.impact], 0) || 1;
  const byBrowser = targetBrowsers.map((browser) => {
    const missing = features.filter((f) =>
      f.missingIn.some(
        (m) => m.id === browser.id && m.version === browser.version,
      ),
    );
    const unsupportedWeight = missing.reduce(
      (sum, f) => sum + IMPACT_WEIGHTS[f.impact],
      0,
    );
    return {
      browser,
      unsupportedFeatures: missing.length,
      supportRatio: 1 - unsupportedWeight / totalWeight,
    };
  });

  // Overall score as an impact-weighted penalty: each finding subtracts its
  // effective impact (usage share × breakage weight). A purely cosmetic gap
  // costs a point or two; a widely-unsupported breaking feature costs a lot.
  const totalPenalty = features.reduce(
    (sum, f) => sum + f.affectedUsage * IMPACT_WEIGHTS[f.impact],
    0,
  );
  const overallScore = Math.max(0, Math.min(100, Math.round(100 - totalPenalty)));

  const bySeverity = { critical: 0, important: 0, medium: 0, low: 0 };
  for (const f of features) bySeverity[f.severity]++;

  return { overallScore, targetBrowsers, features, byBrowser, bySeverity };
}
