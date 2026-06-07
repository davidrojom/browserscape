import { describe, it, expect } from "vitest";
import { impactOf, IMPACT_WEIGHTS, effectiveImpact } from "../impact.js";

describe("impactOf", () => {
  it("classifies cursors and resize as cosmetic (graceful degradation)", () => {
    // Unsupported cursor/resize values are silently ignored: the browser shows
    // the default cursor / a non-resizable textarea. No layout or visual break.
    expect(impactOf("css3-cursors")).toBe("cosmetic");
    expect(impactOf("css3-cursors-newer")).toBe("cosmetic");
    expect(impactOf("css3-cursors-grab")).toBe("cosmetic");
    expect(impactOf("css-resize")).toBe("cosmetic");
  });

  it("classifies layout/functional features as breaking", () => {
    expect(impactOf("css-grid")).toBe("breaking");
    expect(impactOf("flexbox-gap")).toBe("breaking");
  });

  it("classifies progressive enhancements as degraded", () => {
    expect(impactOf("css-backdrop-filter")).toBe("degraded");
    expect(impactOf("css-text-wrap-balance")).toBe("degraded");
  });

  it("defaults unknown features to degraded", () => {
    expect(impactOf("some-brand-new-feature")).toBe("degraded");
  });

  it("classifies guaranteed-invisible fallbacks as none (hidden tier)", () => {
    // font-family value keywords degrade through the fallback list with zero
    // visual cost; they carry no signal, so they are hidden from the report.
    expect(impactOf("extended-system-fonts")).toBe("none");
    expect(impactOf("font-family-system-ui")).toBe("none");
  });
});

describe("IMPACT_WEIGHTS", () => {
  it("orders breaking > degraded > cosmetic > none", () => {
    expect(IMPACT_WEIGHTS.breaking).toBe(1);
    expect(IMPACT_WEIGHTS.degraded).toBe(0.3);
    expect(IMPACT_WEIGHTS.cosmetic).toBe(0.05);
    expect(IMPACT_WEIGHTS.none).toBe(0);
    expect(IMPACT_WEIGHTS.breaking).toBeGreaterThan(IMPACT_WEIGHTS.degraded);
    expect(IMPACT_WEIGHTS.degraded).toBeGreaterThan(IMPACT_WEIGHTS.cosmetic);
    expect(IMPACT_WEIGHTS.cosmetic).toBeGreaterThan(IMPACT_WEIGHTS.none);
  });
});

describe("effectiveImpact", () => {
  it("scales raw usage by the feature's impact weight", () => {
    // Same 11.56% missing-usage produces wildly different effective impact.
    expect(effectiveImpact(11.56, "css-grid")).toBeCloseTo(11.56, 5); // breaking
    expect(effectiveImpact(11.56, "css-resize")).toBeCloseTo(0.578, 5); // cosmetic
  });

  it("a cosmetic feature cannot reach the critical band even at full usage", () => {
    // 100% * 0.05 = 5 is the ceiling; below that a cosmetic gap is never the
    // 5%+ effective impact that the default thresholds call 'critical'.
    expect(effectiveImpact(100, "css-resize")).toBeLessThanOrEqual(5);
  });
});
