import type { Severity, SeverityThresholds } from "./types.js";

export function classifySeverity(
  affectedUsage: number,
  thresholds: SeverityThresholds,
): Severity {
  if (affectedUsage >= thresholds.critico) return "critico";
  if (affectedUsage >= thresholds.importante) return "importante";
  if (affectedUsage >= thresholds.medio) return "medio";
  return "bajo";
}
