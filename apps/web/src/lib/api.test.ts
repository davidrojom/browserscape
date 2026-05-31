import { describe, it, expect, vi, afterEach } from "vitest";
import { analyze, ApiError } from "./api.js";

afterEach(() => vi.restoreAllMocks());

describe("analyze", () => {
  it("posts to the backend and returns parsed json", async () => {
    const body = {
      url: "http://x",
      pagesAnalyzed: 1,
      report: {},
      perPage: [],
    };
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(body), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    );
    const res = await analyze("http://x", { apiBase: "http://api" }, {});
    expect(spy).toHaveBeenCalledWith(
      "http://api/analyze",
      expect.objectContaining({ method: "POST" }),
    );
    expect(res.url).toBe("http://x");
  });

  it("throws ApiError on non-ok responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "bad" }), { status: 400 }),
    );
    await expect(
      analyze("nope", { apiBase: "http://api" }, {}),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
