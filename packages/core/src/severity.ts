import type { Severity, SeverityThresholds } from "./types.js";

export function classifySeverity(
  affectedUsage: number,
  thresholds: SeverityThresholds,
): Severity {
  if (affectedUsage >= thresholds.critical) return "critical";
  if (affectedUsage >= thresholds.important) return "important";
  if (affectedUsage >= thresholds.medium) return "medium";
  return "low";
}
