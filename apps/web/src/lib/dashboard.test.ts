import { describe, it, expect } from "vitest";
import {
  SEVERITY_ORDER,
  criticalFeatures,
  filterBySeverity,
  featuresFailingIn,
  scoreColor,
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
  it("orders critico first, bajo last", () => {
    expect(SEVERITY_ORDER).toEqual(["critico", "importante", "medio", "bajo"]);
  });
});

describe("criticalFeatures", () => {
  it("returns only critico features", () => {
    const out = criticalFeatures([
      f("critico", "a"),
      f("medio", "b"),
      f("critico", "c"),
    ]);
    expect(out.map((x) => x.featureId)).toEqual(["a", "c"]);
  });
});

describe("filterBySeverity", () => {
  it("returns all when filter is null", () => {
    expect(filterBySeverity([f("critico", "a"), f("bajo", "b")], null)).toHaveLength(2);
  });
  it("filters to one severity", () => {
    expect(
      filterBySeverity([f("critico", "a"), f("bajo", "b")], "bajo").map(
        (x) => x.featureId,
      ),
    ).toEqual(["b"]);
  });
});

describe("featuresFailingIn", () => {
  const safari = { id: "safari", name: "Safari", version: "16" };
  const firefox = { id: "firefox", name: "Firefox", version: "121" };
  const feats: FeatureFinding[] = [
    { ...f("critico", "a"), missingIn: [safari] },
    { ...f("medio", "b"), missingIn: [firefox] },
    { ...f("bajo", "c"), missingIn: [safari, firefox] },
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
