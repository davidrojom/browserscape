import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer, type Server } from "node:http";
import { chromium, type Browser } from "playwright";
import { extractPageCss } from "./page-extractor.js";

let server: Server;
let browser: Browser;
let base: string;

beforeAll(async () => {
  server = createServer((req, res) => {
    if (req.url === "/style.css") {
      res.setHeader("content-type", "text/css");
      res.end(".ext { display: flow-root; }");
      return;
    }
    res.setHeader("content-type", "text/html");
    res.end(
      `<html><head><link rel="stylesheet" href="/style.css">` +
        `<style>.inl { gap: 1px; }</style></head>` +
        `<body><a href="/about">about</a></body></html>`,
    );
  });
  await new Promise<void>((r) => server.listen(0, r));
  const port = (server.address() as { port: number }).port;
  base = `http://127.0.0.1:${port}/`;
  browser = await chromium.launch();
}, 60000);

afterAll(async () => {
  await browser?.close();
  await new Promise<void>((r) => server.close(() => r()));
});

describe("extractPageCss", () => {
  it("collects inline and same-origin external CSS plus links", async () => {
    const page = await browser.newPage();
    const result = await extractPageCss(page, base);
    await page.close();
    const allCss = result.sources.map((s) => s.css).join("\n");
    expect(allCss).toContain("flow-root");
    expect(allCss).toContain("gap");
    expect(result.links.some((l) => l.endsWith("/about"))).toBe(true);
  }, 60000);
});
