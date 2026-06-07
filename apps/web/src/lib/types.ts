export type Severity = "critical" | "important" | "medium" | "low";

/** Breakage class behind a finding's severity. `none` features are hidden. */
export type ImpactClass = "breaking" | "degraded" | "cosmetic" | "none";

export interface BrowserRef {
  id: string;
  name: string;
  version: string;
}

export interface FeatureFinding {
  featureId: string;
  title: string;
  severity: Severity;
  /** Optional: absent on responses produced before impact scoring shipped. */
  impact?: ImpactClass;
  affectedUsage: number;
  missingIn: BrowserRef[];
  occurrences: { origin: string; line?: number; column?: number }[];
}

export interface BrowserSupport {
  browser: BrowserRef;
  unsupportedFeatures: number;
  supportRatio: number;
}

export interface CompatibilityReport {
  overallScore: number;
  targetBrowsers: BrowserRef[];
  features: FeatureFinding[];
  byBrowser: BrowserSupport[];
  bySeverity: Record<Severity, number>;
}

export interface PageScore {
  url: string;
  featureCount: number;
}

export interface AnalyzeResponse {
  url: string;
  pagesAnalyzed: number;
  report: CompatibilityReport;
  perPage: PageScore[];
}
