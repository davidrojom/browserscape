import { describe, it, expect } from "vitest";
import { normalizeUrl, isSameOrigin, extractLinks } from "./crawl-utils.js";

describe("normalizeUrl", () => {
  it("strips hash and trailing slash", () => {
    expect(normalizeUrl("http://a.com/p/#x")).toBe("http://a.com/p");
    expect(normalizeUrl("http://a.com/")).toBe("http://a.com");
  });
  it("resolves relative against base", () => {
    expect(normalizeUrl("/b", "http://a.com/p")).toBe("http://a.com/b");
  });
});

describe("isSameOrigin", () => {
  it("true for same origin", () =>
    expect(isSameOrigin("http://a.com/x", "http://a.com/y")).toBe(true));
  it("false for different host", () =>
    expect(isSameOrigin("http://a.com", "http://b.com")).toBe(false));
});

describe("extractLinks", () => {
  it("returns absolute same-origin hrefs found in anchor list", () => {
    const links = extractLinks(
      ["/a", "http://a.com/b", "http://other.com/c", "#frag"],
      "http://a.com/",
    );
    expect(links).toContain("http://a.com/a");
    expect(links).toContain("http://a.com/b");
    expect(links).not.toContain("http://other.com/c");
  });
});
