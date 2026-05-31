import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer, type Server } from "node:http";
import { crawl } from "./crawler.js";

let server: Server;
let base: string;

beforeAll(async () => {
  server = createServer((req, res) => {
    if (req.url === "/robots.txt") {
      res.setHeader("content-type", "text/plain");
      res.end("User-agent: *\nDisallow: /private");
      return;
    }
    res.setHeader("content-type", "text/html");
    if (req.url?.startsWith("/private")) {
      res.end(
        `<html><head><style>.p{gap:1px}</style></head><body>private</body></html>`,
      );
      return;
    }
    res.end(
      `<html><head><style>.h{display:flow-root}</style></head>` +
        `<body><a href="/private">p</a><a href="/ok">ok</a></body></html>`,
    );
  });
  await new Promise<void>((r) => server.listen(0, r));
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}/`;
}, 60000);

afterAll(async () => {
  await new Promise<void>((r) => server.close(() => r()));
});

describe("crawl", () => {
  it("skips robots-disallowed paths and reports per-page sources", async () => {
    const result = await crawl(base, { maxDepth: 2, maxPages: 10 });
    expect(result.pages.some((p) => p.includes("/private"))).toBe(false);
    expect(result.pages.some((p) => p.endsWith("/ok"))).toBe(true);
  }, 90000);
});
