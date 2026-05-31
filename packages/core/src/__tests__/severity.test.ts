import { describe, it, expect } from "vitest";
import { classifySeverity } from "../severity.js";
import { DEFAULT_THRESHOLDS } from "../types.js";

describe("classifySeverity", () => {
  const t = DEFAULT_THRESHOLDS;
  it("critico when >= 5%", () => expect(classifySeverity(7, t)).toBe("critico"));
  it("critico at exactly 5%", () =>
    expect(classifySeverity(5, t)).toBe("critico"));
  it("importante between 1 and 5", () =>
    expect(classifySeverity(2.3, t)).toBe("importante"));
  it("medio between 0.1 and 1", () =>
    expect(classifySeverity(0.5, t)).toBe("medio"));
  it("bajo below 0.1", () =>
    expect(classifySeverity(0.02, t)).toBe("bajo"));
  it("bajo at 0", () => expect(classifySeverity(0, t)).toBe("bajo"));
});
