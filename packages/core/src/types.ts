export type Severity = "critico" | "importante" | "medio" | "bajo";

export interface CssSource {
  css: string;
  origin: string;
}

export interface SeverityThresholds {
  critico: number; // >= this affected usage % -> critico
  importante: number; // >= -> importante
  medio: number; // >= -> medio  (below -> bajo)
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
  critico: 5,
  importante: 1,
  medio: 0.1,
};
