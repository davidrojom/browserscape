import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer, type Server } from "node:http";
import { chromium, type Browser } from "playwright";
import { LAUNCH_ARGS, newStealthContext } from "./stealth.js";

let server: Server;
let browser: Browser;
let base: string;

beforeAll(async () => {
  server = createServer((req, res) => {
    res.setHeader("content-type", "text/html");
    res.end(`<html><body>ok</body></html>`);
  });
  await new Promise<void>((r) => server.listen(0, r));
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}/`;
  browser = await chromium.launch({ args: LAUNCH_ARGS });
}, 60000);

afterAll(async () => {
  await browser?.close();
  await new Promise<void>((r) => server.close(() => r()));
});

describe("newStealthContext", () => {
  it("hides the common headless automation tells", async () => {
    const context = await newStealthContext(browser);
    const page = await context.newPage();
    await page.goto(base, { waitUntil: "load" });

    const fingerprint = await page.evaluate(() => ({
      webdriver: navigator.webdriver,
      ua: navigator.userAgent,
      languages: navigator.languages,
      hasChrome: typeof (window as unknown as { chrome?: unknown }).chrome,
    }));

    await context.close();

    expect(fingerprint.webdriver).toBeFalsy();
    expect(fingerprint.ua).not.toMatch(/Headless/i);
    expect(fingerprint.languages).toEqual(["en-US", "en"]);
    expect(fingerprint.hasChrome).toBe("object");
  }, 60000);
});
