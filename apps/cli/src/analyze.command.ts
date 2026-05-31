import { Command, CommandRunner, Option } from "nest-commander";
import { input } from "@inquirer/prompts";
import { AnalyzeService } from "./analyze.service.js";
import { formatReport } from "./report/reporter.js";

interface CommandOptions {
  url?: string;
  browsers?: string;
  maxDepth?: number;
  maxPages?: number;
}

@Command({
  name: "analyze",
  description: "Analyze a URL's CSS browser compatibility",
  options: { isDefault: true },
})
export class AnalyzeCommand extends CommandRunner {
  constructor(private readonly service: AnalyzeService) {
    super();
  }

  async run(_args: string[], options: CommandOptions): Promise<void> {
    const url = options.url ?? (await input({ message: "URL to analyze:" }));
    console.log(`\nAnalyzing ${url} ...`);
    const { report, pages } = await this.service.analyze(url, {
      browserslist: options.browsers,
      crawl: { maxDepth: options.maxDepth, maxPages: options.maxPages },
    });
    console.log(formatReport(report, { pages }));
  }

  @Option({ flags: "-u, --url <url>", description: "URL (skips the prompt)" })
  parseUrl(v: string): string {
    return v;
  }

  @Option({ flags: "-b, --browsers <query>", description: "browserslist query" })
  parseBrowsers(v: string): string {
    return v;
  }

  @Option({ flags: "--max-depth <n>", description: "crawl depth" })
  parseDepth(v: string): number {
    return Number(v);
  }

  @Option({ flags: "--max-pages <n>", description: "max pages" })
  parsePages(v: string): number {
    return Number(v);
  }
}
