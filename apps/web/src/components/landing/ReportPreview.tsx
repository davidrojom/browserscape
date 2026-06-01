import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { scoreVar, scoreVerdict } from "../../lib/dashboard.js";

/**
 * The hero's product preview: a compact, self-assembling version of the report
 * Browserscape produces at /analysis. It shows the actual output — score gauge,
 * severity breakdown, support-by-browser — rather than describing it. The report
 * "assembles" on view (ring draws, bars fill) and re-scans periodically, the
 * same render→report beat the real loading screen has. Static under reduced
 * motion; pauses on hover.
 *
 * Numbers mirror lib/sample.ts so the preview stays consistent with the real
 * dashboard's sample report.
 */

const REPORT = {
  url: "acme.studio",
  score: 73,
  pages: 12,
  features: 22,
  severity: [
    { label: "Critical", count: 2, color: "var(--color-broken)" },
    { label: "Important", count: 4, color: "var(--color-warn)" },
    { label: "Medium", count: 7, color: "var(--color-cool)" },
    { label: "Low", count: 9, color: "var(--color-faint)" },
  ],
  // worst-supported first, exactly how the real BrowserBars orders them
  browsers: [
    { slug: "safari", name: "Safari 16", pct: 62 },
    { slug: "samsung-internet", name: "Samsung 23", pct: 79 },
    { slug: "firefox", name: "Firefox 121", pct: 84 },
    { slug: "chrome", name: "Chrome 120", pct: 97 },
  ],
} as const;

const RING_SIZE = 92;
const RING_STROKE = 9;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_C = 2 * Math.PI * RING_R;
const SCAN_INTERVAL = 6500;

export function ReportPreview() {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [paused, setPaused] = useState(false);
  // each tick re-runs the assemble animation (ring + bars), reading as a re-scan
  const [scan, setScan] = useState(0);

  useEffect(() => {
    if (reduce || !inView || paused) return;
    const id = setInterval(() => setScan((s) => s + 1), SCAN_INTERVAL);
    return () => clearInterval(id);
  }, [reduce, inView, paused]);

  const run = inView || reduce;
  const score = useCountUp(REPORT.score, run, reduce, scan);
  const color = scoreVar(REPORT.score);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)] before:absolute before:inset-x-0 before:top-0 before:z-20 before:h-px before:bg-gradient-to-r before:from-transparent before:via-accent/40 before:to-transparent">
        {!reduce && (
          <div className="scanline pointer-events-none absolute inset-x-0 top-0 z-10 h-16" />
        )}

        {/* window chrome + the URL under audit */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <span className="flex shrink-0 gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          </span>
          <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted">
            {REPORT.url}
          </span>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-accent/30 bg-accent/[0.07] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Report
          </span>
        </div>

        <div className="p-5">
          {/* score gauge + verdict — the SummaryBand, distilled */}
          <div className="flex items-center gap-4">
            <div
              className="relative shrink-0"
              style={{ width: RING_SIZE, height: RING_SIZE }}
            >
              <svg
                width={RING_SIZE}
                height={RING_SIZE}
                className="-rotate-90"
              >
                <circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_R}
                  fill="none"
                  stroke="var(--color-line)"
                  strokeWidth={RING_STROKE}
                />
                <motion.circle
                  key={scan}
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_R}
                  fill="none"
                  stroke={color}
                  strokeWidth={RING_STROKE}
                  strokeLinecap="round"
                  strokeDasharray={RING_C}
                  initial={reduce ? false : { strokeDashoffset: RING_C }}
                  animate={{ strokeDashoffset: RING_C * (1 - REPORT.score / 100) }}
                  transition={{ duration: 1.1, ease: [0.23, 1, 0.32, 1] }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="font-mono text-2xl font-semibold tabular-nums leading-none"
                  style={{ color }}
                >
                  {score}
                </span>
                <span className="mt-0.5 text-[10px] text-faint">/ 100</span>
              </div>
            </div>

            <div className="min-w-0">
              <div className="text-xs text-muted">Compatibility score</div>
              <div className="mt-1 text-lg font-medium leading-tight" style={{ color }}>
                {scoreVerdict(REPORT.score)}
              </div>
              <div className="mt-1.5 font-mono text-xs text-faint">
                {REPORT.pages} pages · {REPORT.features} features
              </div>
            </div>
          </div>

          {/* severity breakdown — the SeverityCards row, compacted */}
          <div className="mt-5 grid grid-cols-4 divide-x divide-line rounded-[10px] border border-line bg-bg/40">
            {REPORT.severity.map((s) => (
              <div key={s.label} className="px-2 py-2.5 text-center">
                <div
                  className="font-mono text-lg font-semibold tabular-nums leading-none"
                  style={{ color: s.color }}
                >
                  {s.count}
                </div>
                <div className="mt-1 text-[10px] text-muted">{s.label}</div>
              </div>
            ))}
          </div>

          {/* support by browser — worst engine first, bars fill on scan */}
          <div className="mt-5">
            <div className="mb-3 text-xs font-medium text-fg">
              Support by browser
            </div>
            <ul className="flex flex-col gap-2.5">
              {REPORT.browsers.map((b, i) => {
                const barColor = scoreVar(b.pct);
                return (
                  <li
                    key={b.slug}
                    className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-2.5"
                  >
                    <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted">
                      <img
                        src={`https://cdn.jsdelivr.net/npm/@browser-logos/${b.slug}/${b.slug}.svg`}
                        alt=""
                        width={14}
                        height={14}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                        className="h-[14px] w-[14px] shrink-0"
                      />
                      <span className="truncate">{b.name}</span>
                    </span>
                    <span className="h-1.5 overflow-hidden rounded-full bg-line">
                      <motion.span
                        key={scan}
                        className="block h-full rounded-full"
                        style={{ background: barColor }}
                        initial={reduce ? false : { width: 0 }}
                        animate={{ width: `${b.pct}%` }}
                        transition={{
                          duration: 0.9,
                          delay: reduce ? 0 : 0.15 + i * 0.08,
                          ease: [0.23, 1, 0.32, 1],
                        }}
                      />
                    </span>
                    <span
                      className="text-right font-mono text-xs tabular-nums"
                      style={{ color: barColor }}
                    >
                      {b.pct}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Tween a number 0→target whenever the scan re-runs. Instant under reduced motion. */
function useCountUp(
  target: number,
  run: boolean,
  reduce: boolean,
  scan: number,
) {
  const [value, setValue] = useState(reduce ? target : 0);

  useEffect(() => {
    if (reduce) {
      setValue(target);
      return;
    }
    if (!run) return;
    const controls = animate(0, target, {
      duration: 1.1,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [target, run, reduce, scan]);

  return value;
}
