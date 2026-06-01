import type { BrowserRef, FeatureFinding, Severity } from "./types.js";

export const SEVERITY_ORDER: Severity[] = [
  "critico",
  "importante",
  "medio",
  "bajo",
];

/** Numeric weight per severity, critical highest. Used for sorting. */
export const SEVERITY_RANK: Record<Severity, number> = {
  critico: 3,
  importante: 2,
  medio: 1,
  bajo: 0,
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  critico: "Critical",
  importante: "Important",
  medio: "Medium",
  bajo: "Low",
};

export function criticalFeatures(features: FeatureFinding[]): FeatureFinding[] {
  return features.filter((f) => f.severity === "critico");
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
  critico: "var(--color-broken)",
  importante: "var(--color-warn)",
  medio: "var(--color-cool)",
  bajo: "var(--color-faint)",
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
