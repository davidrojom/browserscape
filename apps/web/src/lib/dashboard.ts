import type { FeatureFinding, Severity } from "./types.js";

export const SEVERITY_ORDER: Severity[] = [
  "critico",
  "importante",
  "medio",
  "bajo",
];

export const SEVERITY_LABEL: Record<Severity, string> = {
  critico: "Crítico",
  importante: "Importante",
  medio: "Medio",
  bajo: "Bajo",
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

export function scoreColor(score: number): "green" | "amber" | "red" {
  if (score >= 90) return "green";
  if (score >= 60) return "amber";
  return "red";
}
