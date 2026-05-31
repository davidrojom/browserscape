import { Injectable } from "@nestjs/common";
import { analyzeCss, type CompatibilityReport } from "@browserscape/core";
import { crawl, type CrawlOptions } from "./crawl/crawler.js";

export interface AnalyzeResult {
  report: CompatibilityReport;
  pages: number;
}

@Injectable()
export class AnalyzeService {
  async analyze(
    url: string,
    opts: { browserslist?: string; crawl?: CrawlOptions } = {},
  ): Promise<AnalyzeResult> {
    const { pages, sources } = await crawl(url, opts.crawl ?? {});
    const report = await analyzeCss(sources, {
      browserslist: opts.browserslist,
    });
    return { report, pages: pages.length };
  }
}
