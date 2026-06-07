import { describe, it, expect } from "vitest";
import { buildFixPrompt } from "./prompt.js";
import type { AnalyzeResponse } from "./types.js";

const base: AnalyzeResponse = {
  url: "https://acme.studio",
  pagesAnalyzed: 3,
  report: {
    overallScore: 73,
    targetBrowsers: [
      { id: "chrome", name: "Chrome", version: "120" },
      { id: "safari", name: "Safari", version: "16" },
    ],
    bySeverity: { critical: 1, important: 1, medium: 0, low: 0 },
    byBrowser: [],
    features: [
      {
        featureId: "css-color-mix",
        title: "color-mix()",
        severity: "important",
        affectedUsage: 22,
        missingIn: [{ id: "safari", name: "Safari", version: "16" }],
        occurrences: [{ origin: "https://acme.studio/#sheet-0", line: 12 }],
      },
      {
        featureId: "css-has",
        title: ":has() selector",
        severity: "critical",
        affectedUsage: 14,
        missingIn: [{ id: "firefox", name: "Firefox", version: "121" }],
        occurrences: [
          { origin: "https://acme.studio/#sheet-0" },
          { origin: "https://acme.studio/work#sheet-1" },
        ],
      },
    ],
  },
  perPage: [],
};

describe("buildFixPrompt", () => {
  it("includes metadata, score and target browsers", () => {
    const out = buildFixPrompt(base);
    expect(out).toContain("https://acme.studio");
    expect(out).toContain("Pages analyzed: 3");
    expect(out).toContain("73/100");
    expect(out).toContain("Chrome 120, Safari 16");
  });

  it("orders critical features before less severe ones", () => {
    const out = buildFixPrompt(base);
    expect(out.indexOf(":has() selector")).toBeLessThan(
      out.indexOf("color-mix()"),
    );
  });

  it("lists the browsers a feature fails in and the deduped pages it appears on", () => {
    const out = buildFixPrompt(base);
    expect(out).toContain("Fails in: Firefox 121");
    // #sheet-N fragment stripped, duplicate origins collapsed
    expect(out).toContain("https://acme.studio/");
    expect(out).toContain("https://acme.studio/work");
    expect(out).not.toContain("#sheet-");
  });

  it("describes a clean report when there are no findings", () => {
    const clean: AnalyzeResponse = {
      ...base,
      report: { ...base.report, features: [] },
    };
    expect(buildFixPrompt(clean)).toContain("No compatibility issues");
  });
});
