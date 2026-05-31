import { chromium } from "playwright";
import type { CssSource } from "@browserscape/core";
import { extractPageCss } from "./page-extractor.js";
import { normalizeUrl } from "./crawl-utils.js";
import { createRobotsChecker } from "./robots.js";

export interface CrawlOptions {
  maxDepth?: number;
  maxPages?: number;
}

export interface PageResult {
  url: string;
  sources: CssSource[];
}

export interface CrawlResult {
  pages: string[];
  perPage: PageResult[];
  sources: CssSource[];
}

export async function crawl(
  startUrl: string,
  options: CrawlOptions = {},
): Promise<CrawlResult> {
  const maxDepth = options.maxDepth ?? 2;
  const maxPages = options.maxPages ?? 50;
  const start = normalizeUrl(startUrl);

  const isAllowed = await createRobotsChecker(start, async (robotsUrl) => {
    const res = await fetch(robotsUrl);
    return res.ok ? await res.text() : null;
  });

  const visited = new Set<string>();
  const succeeded: string[] = [];
  const queue: Array<{ url: string; depth: number }> = [
    { url: start, depth: 0 },
  ];
  const perPage: PageResult[] = [];
  const sources: CssSource[] = [];

  const browser = await chromium.launch();
  try {
    while (queue.length > 0 && visited.size < maxPages) {
      const { url, depth } = queue.shift()!;
      if (visited.has(url) || !isAllowed(url)) continue;
      visited.add(url);

      const page = await browser.newPage();
      try {
        const { sources: pageSources, links } = await extractPageCss(page, url);
        succeeded.push(url);
        perPage.push({ url, sources: pageSources });
        sources.push(...pageSources);
        if (depth < maxDepth) {
          for (const link of links) {
            if (!visited.has(link) && isAllowed(link))
              queue.push({ url: link, depth: depth + 1 });
          }
        }
      } catch (err) {
        // Don't fail the whole crawl on one page, but never swallow silently —
        // a hidden failure would masquerade as a clean (100%) result.
        console.warn(
          `browserscape: failed to analyze ${url}: ${(err as Error).message}`,
        );
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  return { pages: succeeded, perPage, sources };
}
