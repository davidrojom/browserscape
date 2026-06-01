import { SEVERITY_ORDER, SEVERITY_LABEL, SEVERITY_VAR } from "../lib/dashboard.js";
import { CountUp } from "./ui/CountUp.js";
import type { Severity } from "../lib/types.js";

/**
 * Severity breakdown. Each card doubles as a filter: selecting one narrows the
 * feature table below and scrolls to it. Selecting the active card clears it.
 */
export function SeverityCards({
  counts,
  active,
  onSelect,
}: {
  counts: Record<Severity, number>;
  active?: Severity | null;
  onSelect?: (severity: Severity | null) => void;
}) {
  const total = SEVERITY_ORDER.reduce((sum, s) => sum + counts[s], 0);
  const interactive = Boolean(onSelect);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {SEVERITY_ORDER.map((s) => {
        const isActive = active === s;
        const share = total ? Math.round((counts[s] / total) * 100) : 0;
        const color = SEVERITY_VAR[s];
        return (
          <button
            key={s}
            type="button"
            disabled={!interactive}
            aria-pressed={isActive}
            onClick={() => onSelect?.(isActive ? null : s)}
            className={`group rounded-[var(--radius-card)] border bg-surface p-4 text-left transition-[transform,border-color,background-color] duration-150 ${
              interactive
                ? "hover:border-line-strong hover:bg-surface-2 active:scale-[0.98] cursor-pointer"
                : "cursor-default"
            } ${isActive ? "border-line-strong bg-surface-2" : "border-line"}`}
            style={isActive ? { borderColor: color } : undefined}
          >
            <div
              className="font-mono text-3xl font-semibold tabular-nums"
              style={{ color }}
            >
              <CountUp value={counts[s]} />
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <span className="text-sm text-muted">{SEVERITY_LABEL[s]}</span>
              <span className="font-mono text-xs tabular-nums text-faint">
                {share}%
              </span>
            </div>
            {/* share track: communicates each band's slice of the total */}
            <span className="mt-2 block h-1 overflow-hidden rounded-full bg-line">
              <span
                className="block h-full rounded-full transition-[width] duration-500"
                style={{ width: `${share}%`, background: color }}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}
