import { describe, it, expect } from "vitest";
import { analyzeCss } from "../analyze.js";
import { DEFAULT_BROWSERSLIST, type Severity } from "../types.js";

const SEVERITY_RANK: Record<Severity, number> = {
  low: 0,
  medium: 1,
  important: 2,
  critical: 3,
};

describe("analyzeCss", () => {
  it("flags an unsupported feature against an old-browser target", async () => {
    const report = await analyzeCss(
      [
        {
          css: "a { width: -webkit-min-content; } .x { display: flow-root; }",
          origin: "test.css",
        },
      ],
      { browserslist: ["ie 11", "chrome 120"] },
    );
    expect(report.targetBrowsers.length).toBeGreaterThan(0);
    expect(report.features.length).toBeGreaterThan(0);
    const f = report.features[0];
    expect(typeof f.featureId).toBe("string");
    expect(f.affectedUsage).toBeGreaterThanOrEqual(0);
    expect(["critical", "important", "medium", "low"]).toContain(f.severity);
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
  });

  it("returns 100 and no features for universally-supported CSS", async () => {
    const report = await analyzeCss(
      [{ css: "a { color: red; }", origin: "test.css" }],
      { browserslist: ["chrome 120", "firefox 120"] },
    );
    expect(report.features).toHaveLength(0);
    expect(report.overallScore).toBe(100);
  });

  it("does not flag font-family value keywords that degrade gracefully", async () => {
    // The Tailwind default stack. ui-sans-serif is Safari-only and system-ui is
    // unsupported on old engines, but font-family is a fallback list: the
    // browser silently skips a keyword it doesn't know and uses the next entry.
    // Nothing breaks, so this must not be reported as a compatibility issue.
    const report = await analyzeCss(
      [
        {
          css: "body { font-family: ui-sans-serif, system-ui, sans-serif; } code { font-family: ui-monospace, monospace; }",
          origin: "tailwind.css",
        },
      ],
      { browserslist: ["chrome 120", "firefox 120", "ie 11"] },
    );
    const fontFindings = report.features.filter(
      (f) =>
        f.featureId === "extended-system-fonts" ||
        f.featureId === "font-family-system-ui",
    );
    expect(fontFindings).toHaveLength(0);
  });

  it("still keeps the score at 100 when the only usage is graceful font fallbacks", async () => {
    const report = await analyzeCss(
      [
        {
          css: "h1 { font-family: ui-serif, Georgia, serif; }",
          origin: "tailwind.css",
        },
      ],
      { browserslist: ["chrome 120", "firefox 120"] },
    );
    expect(report.features).toHaveLength(0);
    expect(report.overallScore).toBe(100);
  });

  it("records occurrences with the source origin", async () => {
    const report = await analyzeCss(
      [{ css: ".x { display: flow-root; }", origin: "page-1.css" }],
      { browserslist: ["ie 11"] },
    );
    expect(report.features.length).toBeGreaterThan(0);
    expect(report.features[0].occurrences[0].origin).toBe("page-1.css");
  });
});

describe("impact-weighted severity", () => {
  it("never marks a cosmetic, gracefully-degrading feature as critical", async () => {
    // resize is unsupported on iOS Safari (~11% of users) but only means a
    // textarea isn't user-resizable — nothing breaks. Raw usage alone would
    // score this 'critical'; impact weighting must keep it out of the red.
    const report = await analyzeCss(
      [{ css: "textarea { resize: vertical; }", origin: "reset.css" }],
      { browserslist: DEFAULT_BROWSERSLIST },
    );
    const resize = report.features.find((f) => f.featureId === "css-resize");
    expect(resize).toBeDefined();
    expect(resize!.impact).toBe("cosmetic");
    expect(resize!.severity).not.toBe("critical");
    // Raw usage is still reported truthfully even though severity is low.
    expect(resize!.affectedUsage).toBeGreaterThan(5);
  });

  it("keeps the overall score high when the only issues are cosmetic", async () => {
    const report = await analyzeCss(
      [{ css: "textarea { resize: vertical; }", origin: "reset.css" }],
      { browserslist: DEFAULT_BROWSERSLIST },
    );
    expect(report.overallScore).toBeGreaterThanOrEqual(95);
  });

  it("weights a breaking feature above a cosmetic one at identical usage", async () => {
    // Both flexbox-gap and resize are missing only on IE 11 here, so they share
    // the exact same affected usage — the only differentiator is impact class.
    const report = await analyzeCss(
      [
        {
          css: ".f { display: flex; gap: 1rem; } textarea { resize: vertical; }",
          origin: "p.css",
        },
      ],
      { browserslist: ["ie 11", "chrome 120"] },
    );
    const gap = report.features.find((f) => f.featureId === "flexbox-gap");
    const resize = report.features.find((f) => f.featureId === "css-resize");
    expect(gap).toBeDefined();
    expect(resize).toBeDefined();
    expect(gap!.impact).toBe("breaking");
    expect(resize!.impact).toBe("cosmetic");
    expect(gap!.affectedUsage).toBe(resize!.affectedUsage);
    expect(SEVERITY_RANK[gap!.severity]).toBeGreaterThan(
      SEVERITY_RANK[resize!.severity],
    );
  });
});
