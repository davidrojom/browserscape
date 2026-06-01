import { Browsers, Info } from "@phosphor-icons/react";
import type { AnalyzeResponse } from "../lib/types.js";

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function ReportMeta({ data }: { data: AnalyzeResponse }) {
  const { report } = data;

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
      <h2 className="mb-4 text-base font-medium">Targets &amp; scope</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-faint">
            <Browsers size={14} />
            Target browsers
          </div>
          <ul className="flex flex-wrap gap-2">
            {report.targetBrowsers.map((b) => (
              <li
                key={`${b.id}-${b.version}`}
                className="rounded-full border border-line bg-surface-2/50 px-2.5 py-1 font-mono text-xs text-muted"
              >
                {b.name} {b.version}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Crawled{" "}
            <span className="font-mono tabular-nums text-fg">
              {data.pagesAnalyzed}
            </span>{" "}
            {data.pagesAnalyzed === 1 ? "page" : "pages"} of{" "}
            <span className="text-fg">{hostnameOf(data.url)}</span> and flagged{" "}
            <span className="font-mono tabular-nums text-fg">
              {report.features.length}
            </span>{" "}
            {report.features.length === 1 ? "feature" : "features"}.
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-faint">
            <Info size={14} />
            How the score works
          </div>
          <p className="text-sm leading-relaxed text-muted">
            The compatibility score weights each browser by its real-world usage
            share, so a gap in a widely-used engine costs more than one in a
            niche browser. Features that degrade gracefully are excluded, so the
            score reflects breakage that users would actually notice. Severity
            is derived from how much traffic each unsupported feature touches.
          </p>
        </div>
      </div>
    </div>
  );
}
