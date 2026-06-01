import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CaretDown } from "@phosphor-icons/react";
import { scoreVar, featuresFailingIn, SEVERITY_VAR } from "../lib/dashboard.js";
import type { BrowserSupport, FeatureFinding } from "../lib/types.js";

export function BrowserBars({
  byBrowser,
  features = [],
}: {
  byBrowser: BrowserSupport[];
  features?: FeatureFinding[];
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<string | null>(null);
  const rows = [...byBrowser].sort((a, b) => a.supportRatio - b.supportRatio);
  const interactive = features.length > 0;

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
      <h2 className="mb-4 text-base font-medium">Support by browser</h2>
      <ul className="flex flex-col gap-1">
        {rows.map((b) => {
          const pct = Math.round(b.supportRatio * 100);
          const color = scoreVar(pct);
          const key = `${b.browser.id}-${b.browser.version}`;
          const isOpen = open === key;
          const failing = interactive
            ? featuresFailingIn(features, b.browser)
            : [];

          return (
            <li key={key} className="flex flex-col">
              <button
                type="button"
                disabled={!interactive}
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : key)}
                className={`grid grid-cols-[9rem_1fr_3rem_1rem] items-center gap-3 rounded-[var(--radius-control)] py-2 text-left transition-colors ${
                  interactive
                    ? "cursor-pointer hover:bg-surface-2/50"
                    : "cursor-default"
                }`}
              >
                <span className="truncate px-1 text-sm text-muted">
                  {b.browser.name} {b.browser.version}
                </span>
                <span className="h-2 overflow-hidden rounded-full bg-line">
                  <motion.span
                    className="block h-full rounded-full"
                    style={{ background: color }}
                    initial={reduce ? false : { width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
                  />
                </span>
                <span
                  className="text-right font-mono text-sm tabular-nums"
                  style={{ color }}
                >
                  {pct}%
                </span>
                {interactive ? (
                  <CaretDown
                    size={13}
                    weight="bold"
                    className={`justify-self-end text-faint transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                ) : (
                  <span />
                )}
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="panel"
                    initial={reduce ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-1 pb-3 pt-1">
                      <div className="mb-2 text-xs text-faint">
                        {failing.length === 0
                          ? "No detected features fail in this browser."
                          : `${failing.length} ${
                              failing.length === 1 ? "feature fails" : "features fail"
                            } here:`}
                      </div>
                      <ul className="flex flex-wrap gap-1.5">
                        {failing.map((f) => (
                          <li
                            key={f.featureId}
                            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2/60 px-2 py-0.5 font-mono text-xs text-muted"
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: SEVERITY_VAR[f.severity] }}
                            />
                            {f.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
