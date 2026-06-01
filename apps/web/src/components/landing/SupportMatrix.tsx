import { Check, X } from "@phosphor-icons/react";
import { Reveal } from "../ui/Reveal.js";

const ENGINES = [
  { slug: "chrome", name: "Chrome" },
  { slug: "edge", name: "Edge" },
  { slug: "firefox", name: "Firefox" },
  { slug: "safari", name: "Safari" },
  { slug: "samsung-internet", name: "Samsung" },
];

// representative support data, ordered worst-supported first
const ROWS: { feature: string; pct: number; support: boolean[] }[] = [
  { feature: "anchor-position", pct: 68, support: [true, true, false, false, false] },
  { feature: "text-wrap: balance", pct: 81, support: [true, true, true, false, false] },
  { feature: "subgrid", pct: 86, support: [true, true, true, true, false] },
  { feature: ":has()", pct: 88, support: [true, true, false, true, false] },
  { feature: "@container", pct: 90, support: [true, true, true, true, false] },
  { feature: "color-mix()", pct: 92, support: [true, true, true, false, true] },
];

export function SupportMatrix() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:py-24">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <Reveal>
          <h2 className="max-w-[20ch] text-3xl font-semibold tracking-tight sm:text-4xl">
            One green column on your machine. A wall of red on theirs.
          </h2>
          <p className="mt-4 max-w-[52ch] leading-relaxed text-muted">
            Every finding is resolved against Baseline and caniuse, then weighted
            by how many of your users sit on an engine that lacks it.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="flex gap-5 font-mono text-xs">
          <span className="flex items-center gap-1.5 text-muted">
            <span className="h-2 w-2 rounded-full bg-accent" /> renders
          </span>
          <span className="flex items-center gap-1.5 text-muted">
            <span className="h-2 w-2 rounded-full bg-broken" /> breaks
          </span>
        </Reveal>
      </div>

      <Reveal delay={0.08} className="mt-8 sm:mt-12">
        <p className="mb-2 text-right font-mono text-xs text-faint sm:hidden">
          swipe to compare engines →
        </p>
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-surface">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-line">
                <th className="px-5 py-4 text-left font-mono text-xs uppercase tracking-wide text-faint">
                  CSS feature
                </th>
                {ENGINES.map((e) => (
                  <th key={e.slug} className="px-3 py-4 text-center">
                    <img
                      src={`https://cdn.jsdelivr.net/npm/@browser-logos/${e.slug}/${e.slug}.svg`}
                      alt={e.name}
                      width={20}
                      height={20}
                      loading="lazy"
                      onError={(ev) => {
                        ev.currentTarget.style.display = "none";
                      }}
                      className="mx-auto h-5 w-5"
                    />
                  </th>
                ))}
                <th className="px-5 py-4 text-right font-mono text-xs uppercase tracking-wide text-faint">
                  Global
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr
                  key={r.feature}
                  className="border-b border-line/60 transition-colors last:border-0 hover:bg-surface-2/50"
                >
                  <td className="px-5 py-3.5 font-mono text-sm text-fg">
                    {r.feature}
                  </td>
                  {r.support.map((ok, i) => (
                    <td key={i} className="px-3 py-3.5 text-center">
                      <span
                        className="inline-grid h-6 w-6 place-items-center rounded-full"
                        style={{
                          color: ok ? "var(--color-accent)" : "var(--color-broken)",
                          background: ok
                            ? "rgba(198,242,78,0.08)"
                            : "rgba(255,107,94,0.08)",
                        }}
                      >
                        {ok ? (
                          <Check size={13} weight="bold" />
                        ) : (
                          <X size={13} weight="bold" />
                        )}
                      </span>
                    </td>
                  ))}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2.5">
                      <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-line sm:block">
                        <span
                          className="block h-full rounded-full"
                          style={{
                            width: `${r.pct}%`,
                            background:
                              r.pct >= 85
                                ? "var(--color-accent)"
                                : "var(--color-warn)",
                          }}
                        />
                      </span>
                      <span className="w-9 text-right font-mono text-sm tabular-nums text-muted">
                        {r.pct}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </section>
  );
}
