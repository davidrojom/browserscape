import { describe, it, expect } from "vitest";
import { formatReport } from "./reporter.js";
import type { CompatibilityReport } from "@browserscape/core";

const report: CompatibilityReport = {
  overallScore: 87,
  targetBrowsers: [{ id: "ie", name: "IE", version: "11" }],
  features: [
    {
      featureId: "flow-root",
      title: "display: flow-root",
      severity: "critical",
      affectedUsage: 6.2,
      missingIn: [{ id: "ie", name: "IE", version: "11" }],
      occurrences: [{ origin: "http://a.com#sheet-0" }],
    },
  ],
  byBrowser: [
    {
      browser: { id: "ie", name: "IE", version: "11" },
      unsupportedFeatures: 1,
      supportRatio: 0,
    },
  ],
  bySeverity: { critical: 1, important: 0, medium: 0, low: 0 },
};

describe("formatReport", () => {
  it("renders score, severity counts and feature titles", () => {
    const out = formatReport(report, { pages: 3 });
    const plain = out.replace(/\[[0-9;]*m/g, ""); // strip ANSI
    expect(plain).toContain("87");
    expect(plain).toContain("display: flow-root");
    expect(plain).toContain("Critico");
    expect(plain).toContain("3"); // pages analyzed
  });
});
