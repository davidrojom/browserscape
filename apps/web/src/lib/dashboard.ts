import type {
  BrowserRef,
  FeatureFinding,
  ImpactClass,
  Severity,
} from "./types.js";

export const SEVERITY_ORDER: Severity[] = [
  "critical",
  "important",
  "medium",
  "low",
];

/** Numeric weight per severity, critical highest. Used for sorting. */
export const SEVERITY_RANK: Record<Severity, number> = {
  critical: 3,
  important: 2,
  medium: 1,
  low: 0,
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Critical",
  important: "Important",
  medium: "Medium",
  low: "Low",
};

export function criticalFeatures(features: FeatureFinding[]): FeatureFinding[] {
  return features.filter((f) => f.severity === "critical");
}

export function filterBySeverity(
  features: FeatureFinding[],
  severity: Severity | null,
): FeatureFinding[] {
  if (!severity) return features;
  return features.filter((f) => f.severity === severity);
}

/** Features whose missingIn list includes the given browser (id + version). */
export function featuresFailingIn(
  features: FeatureFinding[],
  browser: BrowserRef,
): FeatureFinding[] {
  return features.filter((f) =>
    f.missingIn.some(
      (m) => m.id === browser.id && m.version === browser.version,
    ),
  );
}

export function scoreColor(score: number): "green" | "amber" | "red" {
  if (score >= 90) return "green";
  if (score >= 60) return "amber";
  return "red";
}

/** CSS color value per severity, drawn from the functional data scale. */
export const SEVERITY_VAR: Record<Severity, string> = {
  critical: "var(--color-broken)",
  important: "var(--color-warn)",
  medium: "var(--color-cool)",
  low: "var(--color-faint)",
};

export function scoreVar(score: number): string {
  if (score >= 90) return "var(--color-ok)";
  if (score >= 60) return "var(--color-warn)";
  return "var(--color-broken)";
}

export function scoreVerdict(score: number): string {
  if (score >= 90) return "Solid compatibility";
  if (score >= 60) return "Needs attention";
  return "High risk";
}

/**
 * Display metadata for a finding's impact class — the breakage axis behind its
 * severity. It explains why a high-usage gap can still rank low: severity is
 * usage share weighted by how badly the page actually breaks.
 */
export const IMPACT_LABEL: Record<ImpactClass, string> = {
  breaking: "Breaking",
  degraded: "Degraded",
  cosmetic: "Cosmetic",
  none: "Hidden",
};

export const IMPACT_VAR: Record<ImpactClass, string> = {
  breaking: "var(--color-broken)",
  degraded: "var(--color-warn)",
  cosmetic: "var(--color-cool)",
  none: "var(--color-faint)",
};

export const IMPACT_BLURB: Record<ImpactClass, string> = {
  breaking:
    "Layout or functionality genuinely breaks where this is unsupported.",
  degraded:
    "Noticeable but usable — a progressive enhancement that falls back cleanly.",
  cosmetic:
    "Degrades gracefully with no layout or visual impact — low priority.",
  none: "No visible impact; hidden from the report.",
};
