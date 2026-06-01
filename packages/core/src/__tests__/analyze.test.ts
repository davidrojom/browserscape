import { describe, it, expect } from "vitest";
import { analyzeCss } from "../analyze.js";

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
    expect(["critico", "importante", "medio", "bajo"]).toContain(f.severity);
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
