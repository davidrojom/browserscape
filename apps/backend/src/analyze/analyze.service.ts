import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { analyzeCss, type CompatibilityReport } from "@browserscape/core";
import { crawl } from "../crawl/crawler.js";
import type { AnalyzeDto } from "./analyze.dto.js";

export interface PageScore {
  url: string;
  featureCount: number;
}

export interface AnalyzeResponse {
  url: string;
  pagesAnalyzed: number;
  report: CompatibilityReport;
  perPage: PageScore[];
}

@Injectable()
export class AnalyzeService {
  async analyze(dto: AnalyzeDto): Promise<AnalyzeResponse> {
    const { pages, perPage, sources } = await crawl(dto.url, {
      maxDepth: dto.maxDepth,
      maxPages: dto.maxPages,
    });

    if (pages.length === 0) {
      // No page could be loaded/rendered — reporting 100% here would be a lie.
      throw new ServiceUnavailableException(
        `Could not load or render ${dto.url}`,
      );
    }

    if (sources.length === 0) {
      // Pages loaded but carried no CSS — typically a bot-protection challenge
      // or block page rendered in place of the real site. With nothing to
      // analyze, a 100% score would be hollow, so fail loudly instead.
      throw new ServiceUnavailableException(
        `Loaded ${dto.url} but found no CSS to analyze — the site may be behind bot protection or blocking automated browsers.`,
      );
    }

    const report = await analyzeCss(sources, {
      browserslist: dto.browserslist,
    });

    const perPageScores: PageScore[] = await Promise.all(
      perPage.map(async (p) => {
        const r = await analyzeCss(p.sources, {
          browserslist: dto.browserslist,
        });
        return { url: p.url, featureCount: r.features.length };
      }),
    );

    return {
      url: dto.url,
      pagesAnalyzed: pages.length,
      report,
      perPage: perPageScores,
    };
  }
}
