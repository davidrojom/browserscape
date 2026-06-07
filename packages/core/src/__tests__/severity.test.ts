import { describe, it, expect } from "vitest";
import { classifySeverity } from "../severity.js";
import { DEFAULT_THRESHOLDS } from "../types.js";

describe("classifySeverity", () => {
  const t = DEFAULT_THRESHOLDS;
  it("critical when >= 5%", () => expect(classifySeverity(7, t)).toBe("critical"));
  it("critical at exactly 5%", () =>
    expect(classifySeverity(5, t)).toBe("critical"));
  it("important between 1 and 5", () =>
    expect(classifySeverity(2.3, t)).toBe("important"));
  it("medium between 0.1 and 1", () =>
    expect(classifySeverity(0.5, t)).toBe("medium"));
  it("low below 0.1", () =>
    expect(classifySeverity(0.02, t)).toBe("low"));
  it("low at 0", () => expect(classifySeverity(0, t)).toBe("low"));
});
