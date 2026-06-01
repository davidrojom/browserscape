import { Lightbulb, CheckCircle } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { SEVERITY_RANK, SEVERITY_VAR, SEVERITY_LABEL } from "../lib/dashboard.js";
import { suggestFix } from "../lib/feature-info.js";
import type { FeatureFinding } from "../lib/types.js";

const MAX = 5;

/** Highest-impact features first: severity, then real-world traffic affected. */
function prioritize(features: FeatureFinding[]): FeatureFinding[] {
  return [...features]
    .sort(
      (a, b) =>
        SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] ||
        b.affectedUsage - a.affectedUsage,
    )
    .slice(0, MAX);
}

export function Recommendations({ features }: { features: FeatureFinding[] }) {
  const reduce = useReducedMotion();
  const top = prioritize(features);
  const recoverable = top.reduce((sum, f) => sum + f.affectedUsage, 0);

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
      <div className="mb-1 flex items-center gap-2">
        <Lightbulb size={18} weight="fill" className="text-accent" />
        <h2 className="text-base font-medium">Recommended next steps</h2>
      </div>

      {top.length === 0 ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-muted">
          <CheckCircle size={18} weight="fill" className="text-ok" />
          Nothing to fix. Every detected feature is supported across your
          targets.
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted">
            Address these first to protect up to{" "}
            <span className="font-mono tabular-nums text-fg">
              {recoverable.toFixed(1)}%
            </span>{" "}
            of affected traffic.
          </p>
          <ol className="flex flex-col gap-3">
            {top.map((f, i) => (
              <motion.li
                key={f.featureId}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.05,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className="flex gap-3"
              >
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line bg-surface-2 font-mono text-xs tabular-nums text-muted">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-mono text-sm font-medium text-fg">
                      {f.title}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 text-xs"
                      style={{ color: SEVERITY_VAR[f.severity] }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: SEVERITY_VAR[f.severity] }}
                      />
                      {SEVERITY_LABEL[f.severity]}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-faint">
                      {f.affectedUsage}% traffic
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted">
                    {suggestFix(f).advice}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
