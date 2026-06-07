import { describe, it, expect } from "vitest";
import {
  featureDescription,
  featureLocations,
  suggestFix,
  featureCategory,
} from "./feature-info.js";
import type { FeatureFinding } from "./types.js";

const make = (over: Partial<FeatureFinding> = {}): FeatureFinding => ({
  featureId: "css-has",
  title: ":has() selector",
  severity: "critical",
  affectedUsage: 10,
  missingIn: [],
  occurrences: [],
  ...over,
});

describe("featureDescription", () => {
  it("returns the curated description for a known feature", () => {
    expect(featureDescription(make())).toMatch(/relational pseudo-class/);
  });

  it("falls back to a sentence built from the title for unknown features", () => {
    const out = featureDescription(
      make({ featureId: "css-unknown-thing", title: "wild feature" }),
    );
    expect(out).toContain("wild feature");
    expect(out).toMatch(/not yet supported/);
  });
});

describe("suggestFix", () => {
  it("returns an @supports snippet for a feature with a known guard", () => {
    const fix = suggestFix(make({ featureId: "css-has" }));
    expect(fix.snippet).toContain("@supports");
    expect(fix.snippet).toContain(":has");
    expect(fix.advice.length).toBeGreaterThan(0);
  });

  it("returns advice without a snippet when no clean guard exists", () => {
    const fix = suggestFix(make({ featureId: "css-text-wrap-balance" }));
    expect(fix.snippet).toBeUndefined();
    expect(fix.advice).toMatch(/degrades/);
  });

  it("falls back to generic guidance for unknown features", () => {
    const fix = suggestFix(make({ featureId: "css-mystery" }));
    expect(fix.advice).toMatch(/@supports/);
  });
});

describe("featureCategory", () => {
  it("maps known features to their CSS area", () => {
    expect(featureCategory(make({ featureId: "css-subgrid" }))).toBe("Layout");
    expect(featureCategory(make({ featureId: "css-has" }))).toBe(
      "Selectors & nesting",
    );
    expect(featureCategory(make({ featureId: "css-color-mix" }))).toBe("Color");
  });

  it("falls back to Other for unknown features", () => {
    expect(featureCategory(make({ featureId: "css-mystery" }))).toBe("Other");
  });
});

describe("featureLocations", () => {
  it("strips #sheet-N fragments and dedupes origins", () => {
    const locs = featureLocations(
      make({
        occurrences: [
          { origin: "https://x.com/#sheet-0" },
          { origin: "https://x.com/#sheet-1" },
          { origin: "https://x.com/about#sheet-0" },
        ],
      }),
    );
    expect(locs).toEqual(["https://x.com/", "https://x.com/about"]);
  });
});
