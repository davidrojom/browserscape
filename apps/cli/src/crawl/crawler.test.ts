import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer, type Server } from "node:http";
import { crawl } from "./crawler.js";

let server: Server;
let base: string;

beforeAll(async () => {
  server = createServer((req, res) => {
    res.setHeader("content-type", "text/html");
    if (req.url === "/about") {
      res.end(
        `<html><head><style>.a{display:flow-root}</style></head><body>about</body></html>`,
      );
      return;
    }
    res.end(
      `<html><head><style>.h{gap:1px}</style></head><body><a href="/about">a</a></body></html>`,
    );
  });
  await new Promise<void>((r) => server.listen(0, r));
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}/`;
}, 60000);

afterAll(async () => {
  await new Promise<void>((r) => server.close(() => r()));
});

describe("crawl", () => {
  it("visits the home page and one linked subpage within limits", async () => {
    const result = await crawl(base, { maxDepth: 2, maxPages: 10 });
    expect(result.pages.length).toBe(2);
    const css = result.sources.map((s) => s.css).join("\n");
    expect(css).toContain("gap");
    expect(css).toContain("flow-root");
  }, 90000);

  it("respects maxPages = 1", async () => {
    const result = await crawl(base, { maxDepth: 2, maxPages: 1 });
    expect(result.pages.length).toBe(1);
  }, 90000);
});
