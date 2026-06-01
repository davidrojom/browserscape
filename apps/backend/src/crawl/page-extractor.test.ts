import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer, type Server } from "node:http";
import { chromium, type Browser } from "playwright";
import { extractPageCss } from "./page-extractor.js";

let server: Server;
let browser: Browser;
let base: string;

beforeAll(async () => {
  server = createServer((req, res) => {
    if (req.url === "/hang") {
      // Never responds: keeps the network busy so "networkidle" would time out.
      return;
    }
    if (req.url === "/blocked") {
      // Simulates a bot-protection / WAF block: the page loads fine but the
      // status says we were denied. Its trivial CSS would otherwise score 100%.
      res.statusCode = 403;
      res.setHeader("content-type", "text/html");
      res.end(
        `<html><head><style>.b{color:red}</style></head><body>Access denied</body></html>`,
      );
      return;
    }
    res.setHeader("content-type", "text/html");
    res.end(
      `<html><head><style>.h{display:flow-root}</style></head>` +
        `<body><a href="/x">x</a><script>fetch("/hang").catch(() => {})</script></body></html>`,
    );
  });
  await new Promise<void>((r) => server.listen(0, r));
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}/`;
  browser = await chromium.launch();
}, 60000);

afterAll(async () => {
  await browser?.close();
  // Force-close the dangling /hang socket so the server can shut down.
  server?.closeAllConnections?.();
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

  // Regression: a page with a never-ending subresource must still be analyzed.
  // With waitUntil:"networkidle" this would throw on the 30s timeout and the
  // crawler would silently report a hollow 100%. waitUntil:"load" fixes it.
  it("extracts CSS even when a subresource never finishes loading", async () => {
    const page = await browser.newPage();
    const started = Date.now();
    const result = await extractPageCss(page, base);
    await page.close();
    expect(Date.now() - started).toBeLessThan(15000); // nowhere near the 30s timeout
    expect(result.sources.map((s) => s.css).join("\n")).toContain("flow-root");
  }, 60000);

  // Regression: a blocked page (403/429/503 from bot protection) loads without
  // a navigation error. It must be rejected, not counted as a clean page whose
  // trivial CSS reports a hollow 100%.
  it("throws on a non-2xx (blocked) response", async () => {
    const page = await browser.newPage();
    await expect(extractPageCss(page, `${base}blocked`)).rejects.toThrow(/403/);
    await page.close();
  }, 60000);
});
