import { describe, it, expect } from "vitest";
import {
  SEVERITY_ORDER,
  criticalFeatures,
  filterBySeverity,
  featuresFailingIn,
  scoreColor,
  IMPACT_LABEL,
  IMPACT_BLURB,
  IMPACT_VAR,
} from "./dashboard.js";
import type { FeatureFinding } from "./types.js";

const f = (
  severity: FeatureFinding["severity"],
  id: string,
): FeatureFinding => ({
  featureId: id,
  title: id,
  severity,
  affectedUsage: 1,
  missingIn: [],
  occurrences: [],
});

describe("SEVERITY_ORDER", () => {
  it("orders critical first, low last", () => {
    expect(SEVERITY_ORDER).toEqual(["critical", "important", "medium", "low"]);
  });
});

describe("criticalFeatures", () => {
  it("returns only critical features", () => {
    const out = criticalFeatures([
      f("critical", "a"),
      f("medium", "b"),
      f("critical", "c"),
    ]);
    expect(out.map((x) => x.featureId)).toEqual(["a", "c"]);
  });
});

describe("filterBySeverity", () => {
  it("returns all when filter is null", () => {
    expect(filterBySeverity([f("critical", "a"), f("low", "b")], null)).toHaveLength(2);
  });
  it("filters to one severity", () => {
    expect(
      filterBySeverity([f("critical", "a"), f("low", "b")], "low").map(
        (x) => x.featureId,
      ),
    ).toEqual(["b"]);
  });
});

describe("featuresFailingIn", () => {
  const safari = { id: "safari", name: "Safari", version: "16" };
  const firefox = { id: "firefox", name: "Firefox", version: "121" };
  const feats: FeatureFinding[] = [
    { ...f("critical", "a"), missingIn: [safari] },
    { ...f("medium", "b"), missingIn: [firefox] },
    { ...f("low", "c"), missingIn: [safari, firefox] },
  ];

  it("returns features whose missingIn matches the browser id and version", () => {
    expect(featuresFailingIn(feats, safari).map((x) => x.featureId)).toEqual([
      "a",
      "c",
    ]);
  });

  it("matches on version, not just id", () => {
    const old = { id: "safari", name: "Safari", version: "14" };
    expect(featuresFailingIn(feats, old)).toHaveLength(0);
  });
});

describe("scoreColor", () => {
  it("green high, amber mid, red low", () => {
    expect(scoreColor(95)).toBe("green");
    expect(scoreColor(75)).toBe("amber");
    expect(scoreColor(40)).toBe("red");
  });
});

describe("impact metadata", () => {
  it("labels each impact tier", () => {
    expect(IMPACT_LABEL.breaking).toBe("Breaking");
    expect(IMPACT_LABEL.degraded).toBe("Degraded");
    expect(IMPACT_LABEL.cosmetic).toBe("Cosmetic");
  });

  it("explains what each tier means for the page", () => {
    expect(IMPACT_BLURB.breaking).toMatch(/break/i);
    expect(IMPACT_BLURB.cosmetic).toMatch(/gracefully|no layout|cosmetic/i);
    expect(IMPACT_BLURB.degraded.length).toBeGreaterThan(0);
  });

  it("assigns a color token per tier", () => {
    expect(IMPACT_VAR.breaking).toContain("--color");
    expect(IMPACT_VAR.cosmetic).toContain("--color");
  });
});
