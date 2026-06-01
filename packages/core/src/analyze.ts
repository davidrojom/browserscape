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
import { NON_BREAKING_FEATURES } from "./non-breaking.js";
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
        // Skip features that degrade gracefully and never break a page (e.g.
        // font-family value keywords). Reporting them would be a false positive.
        if (NON_BREAKING_FEATURES.has(u.feature)) return;
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
      byFeature.set(u.feature, {
        featureId: u.feature,
        title: u.featureData.title ?? u.feature,
        severity: classifySeverity(affectedUsage, thresholds),
        affectedUsage: Number(affectedUsage.toFixed(2)),
        missingIn,
        occurrences: [{ origin: u.origin, line: u.line, column: u.column }],
      });
    }
  }
  const features = [...byFeature.values()].sort(
    (a, b) => b.affectedUsage - a.affectedUsage,
  );

  // Per-browser: count features whose missingIn includes that browser.
  const byBrowser = targetBrowsers.map((browser) => {
    const unsupportedFeatures = features.filter((f) =>
      f.missingIn.some(
        (m) => m.id === browser.id && m.version === browser.version,
      ),
    ).length;
    const total = features.length || 1;
    return {
      browser,
      unsupportedFeatures,
      supportRatio: 1 - unsupportedFeatures / total,
    };
  });

  // Usage-weighted overall score.
  let weightSum = 0;
  let weightedSupport = 0;
  for (const b of byBrowser) {
    const usage = affectedUsageFor([b.browser]); // single-browser coverage = its usage %
    weightSum += usage;
    weightedSupport += usage * b.supportRatio;
  }
  const overallScore =
    features.length === 0 || weightSum === 0
      ? 100
      : Math.round((weightedSupport / weightSum) * 100);

  const bySeverity = { critico: 0, importante: 0, medio: 0, bajo: 0 };
  for (const f of features) bySeverity[f.severity]++;

  return { overallScore, targetBrowsers, features, byBrowser, bySeverity };
}
