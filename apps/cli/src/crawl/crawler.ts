import { chromium } from "playwright";
import type { CssSource } from "@browserscape/core";
import { extractPageCss } from "./page-extractor.js";
import { normalizeUrl } from "./crawl-utils.js";

export interface CrawlOptions {
  maxDepth?: number;
  maxPages?: number;
}

export interface CrawlResult {
  pages: string[];
  sources: CssSource[];
}

export async function crawl(
  startUrl: string,
  options: CrawlOptions = {},
): Promise<CrawlResult> {
  const maxDepth = options.maxDepth ?? 2;
  const maxPages = options.maxPages ?? 50;
  const start = normalizeUrl(startUrl);

  const visited = new Set<string>();
  const queue: Array<{ url: string; depth: number }> = [
    { url: start, depth: 0 },
  ];
  const sources: CssSource[] = [];

  const browser = await chromium.launch();
  try {
    while (queue.length > 0 && visited.size < maxPages) {
      const { url, depth } = queue.shift()!;
      if (visited.has(url)) continue;
      visited.add(url);

      const page = await browser.newPage();
      try {
        const { sources: pageSources, links } = await extractPageCss(page, url);
        sources.push(...pageSources);
        if (depth < maxDepth) {
          for (const link of links) {
            if (!visited.has(link)) queue.push({ url: link, depth: depth + 1 });
          }
        }
      } catch {
        // skip pages that fail to load
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  return { pages: [...visited], sources };
}
