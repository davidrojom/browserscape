import { describe, it, expect } from "vitest";
import { missingDataToRefs, refsToBrowserslistTokens } from "../browsers.js";

describe("missingDataToRefs", () => {
  it("flattens caniuse missingData into BrowserRefs", () => {
    const refs = missingDataToRefs({
      ie: { "8": "n", "9": "n" },
      firefox: { "30": "n" },
    });
    expect(refs).toContainEqual({ id: "ie", name: "IE", version: "8" });
    expect(refs).toContainEqual({ id: "ie", name: "IE", version: "9" });
    expect(refs).toContainEqual({
      id: "firefox",
      name: "Firefox",
      version: "30",
    });
    expect(refs).toHaveLength(3);
  });
});

describe("refsToBrowserslistTokens", () => {
  it("maps refs to browserslist tokens", () => {
    expect(
      refsToBrowserslistTokens([{ id: "ie", name: "IE", version: "8" }]),
    ).toEqual(["ie 8"]);
  });
});
