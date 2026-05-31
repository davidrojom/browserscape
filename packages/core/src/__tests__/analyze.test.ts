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

  it("records occurrences with the source origin", async () => {
    const report = await analyzeCss(
      [{ css: ".x { display: flow-root; }", origin: "page-1.css" }],
      { browserslist: ["ie 11"] },
    );
    expect(report.features.length).toBeGreaterThan(0);
    expect(report.features[0].occurrences[0].origin).toBe("page-1.css");
  });
});
