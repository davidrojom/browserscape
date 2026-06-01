import { useState } from "react";
import { Check, X } from "@phosphor-icons/react";
import { SEVERITY_RANK, SEVERITY_VAR } from "../lib/dashboard.js";
import type { BrowserRef, FeatureFinding } from "../lib/types.js";

const COLLAPSED = 12;

function isSupported(feature: FeatureFinding, browser: BrowserRef): boolean {
  return !feature.missingIn.some(
    (m) => m.id === browser.id && m.version === browser.version,
  );
}

export function CompatibilityMatrix({
  features,
  browsers,
}: {
  features: FeatureFinding[];
  browsers: BrowserRef[];
}) {
  const [showAll, setShowAll] = useState(false);

  const ordered = [...features].sort(
    (a, b) =>
      SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] ||
      b.affectedUsage - a.affectedUsage,
  );
  const rows = showAll ? ordered : ordered.slice(0, COLLAPSED);
  const hidden = ordered.length - rows.length;

  if (features.length === 0 || browsers.length === 0) return null;

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 className="text-base font-medium">Compatibility matrix</h2>
        <span className="text-xs text-muted">Feature support per target</span>
      </div>
      <p className="mb-4 text-sm text-muted">
        Each cell shows whether a detected feature is supported in that browser.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-surface pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-faint">
                Feature
              </th>
              {browsers.map((b) => (
                <th
                  key={`${b.id}-${b.version}`}
                  className="px-2 pb-3 text-center align-bottom"
                >
                  <span className="block text-xs font-medium text-muted">
                    {b.name}
                  </span>
                  <span className="block font-mono text-[11px] tabular-nums text-faint">
                    {b.version}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => (
              <tr key={f.featureId} className="border-t border-line">
                <td className="sticky left-0 z-10 bg-surface py-2.5 pr-4">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: SEVERITY_VAR[f.severity] }}
                    />
                    <span className="font-mono text-xs text-fg">{f.title}</span>
                  </span>
                </td>
                {browsers.map((b) => {
                  const ok = isSupported(f, b);
                  return (
                    <td key={`${b.id}-${b.version}`} className="px-2 py-2.5">
                      <span className="flex justify-center">
                        {ok ? (
                          <Check
                            size={15}
                            weight="bold"
                            className="text-ok/55"
                            aria-label="Supported"
                          />
                        ) : (
                          <X
                            size={15}
                            weight="bold"
                            className="text-broken"
                            aria-label="Not supported"
                          />
                        )}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hidden > 0 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-4 w-full rounded-[var(--radius-control)] border border-line py-2 text-sm text-muted transition-colors hover:border-line-strong hover:text-fg active:scale-[0.99]"
        >
          Show {hidden} more {hidden === 1 ? "feature" : "features"}
        </button>
      )}
      {showAll && ordered.length > COLLAPSED && (
        <button
          onClick={() => setShowAll(false)}
          className="mt-4 w-full rounded-[var(--radius-control)] border border-line py-2 text-sm text-muted transition-colors hover:border-line-strong hover:text-fg active:scale-[0.99]"
        >
          Show less
        </button>
      )}
    </div>
  );
}
