import { describe, it, expect } from "vitest";
import { createRobotsChecker } from "./robots.js";

describe("createRobotsChecker", () => {
  it("allows everything when robots.txt is empty/unavailable", async () => {
    const check = await createRobotsChecker(
      "http://127.0.0.1:1/",
      async () => null,
    );
    expect(check("http://127.0.0.1:1/any")).toBe(true);
  });

  it("disallows paths blocked for our agent", async () => {
    const body = "User-agent: *\nDisallow: /private";
    const check = await createRobotsChecker("http://a.com/", async () => body);
    expect(check("http://a.com/private/x")).toBe(false);
    expect(check("http://a.com/public")).toBe(true);
  });
});
