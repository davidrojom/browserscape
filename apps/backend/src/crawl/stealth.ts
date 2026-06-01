import type { Browser, BrowserContext } from "playwright";

/**
 * Launch flags + a browser context configured to look like an ordinary Chrome
 * user, so a legitimate compatibility crawl is not blocked by the trivial
 * automation heuristics most WAFs apply (the default Playwright headless build
 * advertises `HeadlessChrome` and sets `navigator.webdriver = true`).
 *
 * Scope is deliberately limited to NOT tripping false positives. This does not,
 * and should not, try to defeat deliberate access controls (CAPTCHA challenges,
 * IP-reputation blocks). robots.txt is still honoured by the crawler.
 */

// In a container Chromium's setuid sandbox usually can't initialise, and the
// default /dev/shm is too small, so both crash the launch. Enable the standard
// container flags via env (set PLAYWRIGHT_NO_SANDBOX=1 in the Docker image)
// rather than always-on, so local runs keep the sandbox.
const CONTAINER_ARGS =
  process.env.PLAYWRIGHT_NO_SANDBOX === "1"
    ? ["--no-sandbox", "--disable-dev-shm-usage"]
    : [];

export const LAUNCH_ARGS = [
  // Removes the AutomationControlled blink feature, the flag that exposes the
  // browser as driver-controlled (and forces navigator.webdriver = true).
  "--disable-blink-features=AutomationControlled",
  ...CONTAINER_ARGS,
];

export async function newStealthContext(
  browser: Browser,
): Promise<BrowserContext> {
  // Derive the UA from the real engine and drop only the "Headless" token, so
  // the advertised version always matches the actual Chromium build. A
  // hardcoded UA that disagrees with the JS engine's real feature set is itself
  // a fingerprint, so we avoid inventing one.
  const probe = await browser.newPage();
  const realUserAgent = await probe.evaluate(() => navigator.userAgent);
  await probe.close();
  const userAgent = realUserAgent.replace(/Headless/gi, "");

  const context = await browser.newContext({
    userAgent,
    viewport: { width: 1366, height: 768 },
    locale: "en-US",
    timezoneId: "America/New_York",
    extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
  });

  // Patch the headless tells that survive the launch flag. Runs before any page
  // script, on every page in the context.
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
    const w = window as unknown as { chrome?: unknown };
    if (!w.chrome) w.chrome = { runtime: {} };
  });

  return context;
}
