import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer, type Server } from "node:http";
import { chromium, type Browser } from "playwright";
import { extractPageCss } from "./page-extractor.js";

let server: Server;
let browser: Browser;
let base: string;

beforeAll(async () => {
  server = createServer((req, res) => {
    res.setHeader("content-type", "text/html");
    res.end(
      `<html><head><style>.h{display:flow-root}</style></head><body><a href="/x">x</a></body></html>`,
    );
  });
  await new Promise<void>((r) => server.listen(0, r));
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}/`;
  browser = await chromium.launch();
}, 60000);

afterAll(async () => {
  await browser?.close();
  await new Promise<void>((r) => server.close(() => r()));
});

describe("extractPageCss", () => {
  it("returns sources tagged with page url and discovered links", async () => {
    const page = await browser.newPage();
    const result = await extractPageCss(page, base);
    await page.close();
    expect(result.sources.map((s) => s.css).join("\n")).toContain("flow-root");
    expect(result.sources.every((s) => s.origin.startsWith(base))).toBe(true);
    expect(result.links.some((l) => l.endsWith("/x"))).toBe(true);
  }, 60000);
});
