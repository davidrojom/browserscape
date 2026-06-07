import type { AnalyzeResponse, BrowserRef } from "./types.js";

const safari: BrowserRef = { id: "safari", name: "Safari", version: "16" };
const firefox: BrowserRef = { id: "firefox", name: "Firefox", version: "121" };
const samsung: BrowserRef = {
  id: "samsung",
  name: "Samsung Internet",
  version: "23",
};
const chrome: BrowserRef = { id: "chrome", name: "Chrome", version: "120" };
const edge: BrowserRef = { id: "edge", name: "Edge", version: "120" };

/**
 * Representative sample report used only to render the real dashboard
 * components inside the landing-page product preview. Marked sample so the
 * numbers are never mistaken for a live audit.
 */
export const SAMPLE_REPORT: AnalyzeResponse = {
  url: "https://acme.studio",
  pagesAnalyzed: 12,
  report: {
    overallScore: 73,
    targetBrowsers: [chrome, safari, firefox, edge, samsung],
    bySeverity: { critical: 2, important: 4, medium: 7, low: 9 },
    byBrowser: [
      { browser: chrome, unsupportedFeatures: 2, supportRatio: 0.97 },
      { browser: edge, unsupportedFeatures: 2, supportRatio: 0.97 },
      { browser: firefox, unsupportedFeatures: 6, supportRatio: 0.84 },
      { browser: samsung, unsupportedFeatures: 5, supportRatio: 0.79 },
      { browser: safari, unsupportedFeatures: 11, supportRatio: 0.62 },
    ],
    features: [
      {
        featureId: "css-has",
        title: ":has() selector",
        severity: "critical",
        impact: "degraded",
        affectedUsage: 14,
        missingIn: [firefox],
        occurrences: [{ origin: "/styles/app.css", line: 42 }],
      },
      {
        featureId: "css-subgrid",
        title: "subgrid",
        severity: "critical",
        impact: "breaking",
        affectedUsage: 6,
        missingIn: [samsung],
        occurrences: [{ origin: "/styles/layout.css", line: 18 }],
      },
      {
        featureId: "css-text-wrap-balance",
        title: "text-wrap: balance",
        severity: "important",
        impact: "degraded",
        affectedUsage: 9,
        missingIn: [safari, samsung],
        occurrences: [{ origin: "/styles/type.css", line: 7 }],
      },
      {
        featureId: "css-color-mix",
        title: "color-mix()",
        severity: "important",
        impact: "degraded",
        affectedUsage: 22,
        missingIn: [safari],
        occurrences: [{ origin: "/styles/theme.css", line: 12 }],
      },
      {
        featureId: "css-container-queries",
        title: "container queries",
        severity: "medium",
        impact: "breaking",
        affectedUsage: 17,
        missingIn: [safari],
        occurrences: [{ origin: "/styles/cards.css", line: 30 }],
      },
    ],
  },
  perPage: [
    { url: "https://acme.studio/", featureCount: 9 },
    { url: "https://acme.studio/work", featureCount: 6 },
    { url: "https://acme.studio/about", featureCount: 4 },
  ],
};
