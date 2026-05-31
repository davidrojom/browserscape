import type { Page } from "playwright";
import type { CssSource } from "@browserscape/core";
import { extractLinks } from "./crawl-utils.js";

export interface PageExtraction {
  sources: CssSource[];
  links: string[];
}

interface InPageResult {
  inline: string[];
  crossOriginHrefs: string[];
  anchors: string[];
}

export async function extractPageCss(
  page: Page,
  url: string,
): Promise<PageExtraction> {
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

  const data = await page.evaluate(() => {
    const inline: string[] = [];
    const crossOriginHrefs: string[] = [];
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        const rules = sheet.cssRules;
        let text = "";
        for (const rule of Array.from(rules)) text += rule.cssText + "\n";
        if (text.trim()) inline.push(text);
      } catch {
        if (sheet.href) crossOriginHrefs.push(sheet.href);
      }
    }
    const anchors = Array.from(document.querySelectorAll("a[href]")).map(
      (a) => (a as HTMLAnchorElement).getAttribute("href") ?? "",
    );
    return { inline, crossOriginHrefs, anchors } as InPageResult;
  });

  const sources: CssSource[] = data.inline.map((css, i) => ({
    css,
    origin: `${url}#sheet-${i}`,
  }));

  for (const href of data.crossOriginHrefs) {
    try {
      const res = await page.request.get(href);
      if (res.ok()) sources.push({ css: await res.text(), origin: href });
    } catch {
      // skip
    }
  }

  return { sources, links: extractLinks(data.anchors, url) };
}
