import { ArrowSquareOut } from "@phosphor-icons/react";
import type { PageScore } from "../lib/types.js";

/** Color the load bar by how a page compares to the busiest one. */
function loadColor(ratio: number): string {
  if (ratio >= 0.67) return "var(--color-broken)";
  if (ratio >= 0.34) return "var(--color-warn)";
  return "var(--color-ok)";
}

function pathOf(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname === "/" ? "/" : u.pathname.replace(/\/$/, "");
  } catch {
    return url;
  }
}

export function PageBreakdown({ pages }: { pages: PageScore[] }) {
  const sorted = [...pages].sort((a, b) => b.featureCount - a.featureCount);
  const max = Math.max(1, ...sorted.map((p) => p.featureCount));
  const total = sorted.reduce((sum, p) => sum + p.featureCount, 0);
  const avg = sorted.length ? Math.round(total / sorted.length) : 0;

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 className="text-base font-medium">
          Pages analyzed <span className="text-muted">({pages.length})</span>
        </h2>
        <span className="text-xs text-muted">
          Ranked by features detected
        </span>
      </div>
      <p className="mb-4 text-sm text-muted">
        <span className="font-mono tabular-nums text-fg">{total}</span> feature
        hits across <span className="font-mono tabular-nums text-fg">{pages.length}</span>{" "}
        {pages.length === 1 ? "page" : "pages"} ·{" "}
        <span className="font-mono tabular-nums text-fg">{avg}</span> avg per page
      </p>

      <ul className="flex flex-col">
        {sorted.map((p, i) => {
          const ratio = p.featureCount / max;
          const color = loadColor(ratio);
          const share = total ? Math.round((p.featureCount / total) * 100) : 0;
          return (
            <li
              key={p.url}
              className={`flex items-center gap-3 py-3 ${
                i > 0 ? "border-t border-line" : ""
              }`}
            >
              <span className="w-5 shrink-0 text-right font-mono text-xs tabular-nums text-faint">
                {i + 1}
              </span>
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="group flex min-w-0 flex-1 items-center gap-1.5"
                title={p.url}
              >
                <span className="min-w-0 truncate font-mono text-sm text-muted transition-colors group-hover:text-fg">
                  {pathOf(p.url)}
                </span>
                <ArrowSquareOut
                  size={13}
                  className="shrink-0 text-faint opacity-0 transition-opacity group-hover:opacity-100"
                />
              </a>
              <span className="flex items-center gap-3">
                <span className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-line sm:block">
                  <span
                    className="block h-full rounded-full transition-[width] duration-500"
                    style={{ width: `${Math.max(ratio * 100, 4)}%`, background: color }}
                  />
                </span>
                <span className="hidden w-9 text-right font-mono text-xs tabular-nums text-faint sm:block">
                  {share}%
                </span>
                <span
                  className="w-6 text-right font-mono text-sm font-medium tabular-nums"
                  style={{ color }}
                >
                  {p.featureCount}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
