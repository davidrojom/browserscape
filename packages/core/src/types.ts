export type Severity = "critical" | "important" | "medium" | "low";

/**
 * How badly a page degrades when a feature is missing, independent of how many
 * users are affected. Severity combines this with usage share so a cosmetic gap
 * on a high-share browser is not treated like a layout-breaking one.
 *
 * `none` is the hidden tier: the gap is guaranteed invisible and carries no
 * signal, so the feature is dropped from the report entirely and never appears
 * as a finding.
 */
export type ImpactClass = "breaking" | "degraded" | "cosmetic" | "none";

export interface CssSource {
  css: string;
  origin: string;
}

export interface SeverityThresholds {
  critical: number; // >= this affected usage % -> critical
  important: number; // >= -> important
  medium: number; // >= -> medium  (below -> low)
}

export interface AnalyzeOptions {
  browserslist?: string | string[];
  severityThresholds?: SeverityThresholds;
}

export interface BrowserRef {
  id: string; // browserslist id, e.g. "ie"
  name: string; // human, e.g. "IE"
  version: string; // e.g. "11"
}

export interface Occurrence {
  origin: string;
  line?: number;
  column?: number;
}

export interface FeatureFinding {
  featureId: string;
  title: string;
  severity: Severity;
  /** Breakage class of the feature, the second axis behind `severity`. */
  impact: ImpactClass;
  /** Raw share of target users on browsers lacking the feature (0..100). */
  affectedUsage: number;
  missingIn: BrowserRef[];
  occurrences: Occurrence[];
}

export interface BrowserSupport {
  browser: BrowserRef;
  unsupportedFeatures: number;
  supportRatio: number; // 0..1
}

export interface CompatibilityReport {
  overallScore: number; // 0..100
  targetBrowsers: BrowserRef[];
  features: FeatureFinding[];
  byBrowser: BrowserSupport[];
  bySeverity: Record<Severity, number>;
}

export const DEFAULT_BROWSERSLIST = "> 0.5%, last 2 versions, not dead";
export const DEFAULT_THRESHOLDS: SeverityThresholds = {
  critical: 5,
  important: 1,
  medium: 0.1,
};
