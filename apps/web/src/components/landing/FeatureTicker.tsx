const TOKENS: { t: string; pct: number }[] = [
  { t: ":has()", pct: 88 },
  { t: "subgrid", pct: 86 },
  { t: "color-mix()", pct: 92 },
  { t: "text-wrap: balance", pct: 81 },
  { t: "@container", pct: 90 },
  { t: "backdrop-filter", pct: 95 },
  { t: "aspect-ratio", pct: 96 },
  { t: "scroll-snap", pct: 97 },
  { t: ":is()", pct: 94 },
  { t: "inset", pct: 93 },
  { t: "@layer", pct: 91 },
  { t: "accent-color", pct: 93 },
  { t: "view-transition", pct: 74 },
  { t: "anchor-position", pct: 68 },
];

/**
 * The one marquee on the page: a live feed of the CSS surface the scanner
 * knows, each token colored by global support. Reinforces what the tool does.
 */
export function FeatureTicker() {
  const row = [...TOKENS, ...TOKENS];
  return (
    <section
      aria-label="CSS features Browserscape detects"
      className="overflow-hidden border-y border-line/60 bg-surface/20 py-4"
    >
      <div className="flex w-max marquee-track gap-3 pr-3">
        {row.map((item, i) => {
          const good = item.pct >= 85;
          return (
            <span
              key={i}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: good ? "var(--color-accent)" : "var(--color-broken)",
                }}
              />
              <span className="font-mono text-sm text-fg">{item.t}</span>
              <span className="font-mono text-xs text-faint">{item.pct}%</span>
            </span>
          );
        })}
      </div>
    </section>
  );
}
