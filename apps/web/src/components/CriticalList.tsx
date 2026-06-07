import { useState } from "react";
import {
  Warning,
  CheckCircle,
  CaretDown,
  FileHtml,
  Browser,
} from "@phosphor-icons/react";
import { criticalFeatures, SEVERITY_VAR } from "../lib/dashboard.js";
import { featureDescription, featureLocations } from "../lib/feature-info.js";
import type { FeatureFinding } from "../lib/types.js";

export function CriticalList({ features }: { features: FeatureFinding[] }) {
  const critical = criticalFeatures(features);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
      <div className="mb-4 flex items-center gap-2">
        <Warning size={18} weight="fill" className="text-broken" />
        <h2 className="text-base font-medium">Critical issues</h2>
      </div>

      {critical.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-muted">
          <CheckCircle size={18} weight="fill" className="text-ok" />
          No critical incompatibilities found.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {critical.map((f) => {
            const isOpen = open === f.featureId;
            const locations = featureLocations(f);
            return (
              <li
                key={f.featureId}
                className="overflow-hidden rounded-[var(--radius-control)] border border-line bg-surface-2/50"
                style={{ borderLeft: `3px solid ${SEVERITY_VAR.critical}` }}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : f.featureId)}
                  className="flex w-full flex-col gap-1 p-4 text-left transition-colors hover:bg-surface-2"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="flex items-center gap-1.5 font-mono text-sm font-medium text-fg">
                      <CaretDown
                        size={14}
                        weight="bold"
                        className={`text-faint transition-transform duration-200 ${
                          isOpen ? "rotate-0" : "-rotate-90"
                        }`}
                      />
                      {f.title}
                    </span>
                    <span className="text-xs text-muted">
                      {f.affectedUsage}% of traffic affected
                    </span>
                  </div>
                  <p className="pl-[1.4rem] text-sm leading-relaxed text-muted">
                    {featureDescription(f)}
                  </p>
                </button>

                {isOpen && (
                  <div className="grid gap-4 border-t border-line px-4 pb-4 pt-3 pl-[1.4rem] sm:grid-cols-2">
                    <div>
                      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-faint">
                        <FileHtml size={13} />
                        Found on {locations.length}{" "}
                        {locations.length === 1 ? "page" : "pages"}
                      </div>
                      <ul className="flex flex-col gap-1">
                        {locations.map((loc) => (
                          <li
                            key={loc}
                            className="truncate font-mono text-xs text-muted"
                            title={loc}
                          >
                            {loc}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-faint">
                        <Browser size={13} />
                        Fails in
                      </div>
                      <ul className="flex flex-wrap gap-1.5">
                        {f.missingIn.length === 0 ? (
                          <li className="text-xs text-muted">—</li>
                        ) : (
                          f.missingIn.map((m) => (
                            <li
                              key={`${m.id}-${m.version}`}
                              className="rounded-full border border-broken/40 bg-[rgba(255,107,94,0.08)] px-2 py-0.5 font-mono text-xs text-broken"
                            >
                              {m.name} {m.version}
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
