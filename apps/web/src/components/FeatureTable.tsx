import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  CaretLeft,
  CaretRight,
  CaretDown,
  CaretUp,
  MagnifyingGlass,
  FileHtml,
  Browser,
  Wrench,
} from "@phosphor-icons/react";
import {
  SEVERITY_ORDER,
  SEVERITY_LABEL,
  SEVERITY_VAR,
  SEVERITY_RANK,
  filterBySeverity,
} from "../lib/dashboard.js";
import {
  featureDescription,
  featureLocations,
  suggestFix,
} from "../lib/feature-info.js";
import { CopySnippet } from "./ui/CopySnippet.js";
import type { FeatureFinding, Severity } from "../lib/types.js";

const PAGE_SIZE = 8;

type SortKey = "severity" | "feature" | "affected";
type SortDir = "asc" | "desc";

const DEFAULT_DIR: Record<SortKey, SortDir> = {
  severity: "desc",
  feature: "asc",
  affected: "desc",
};

function compare(a: FeatureFinding, b: FeatureFinding, key: SortKey): number {
  if (key === "feature") return a.title.localeCompare(b.title);
  if (key === "affected") return a.affectedUsage - b.affectedUsage;
  // severity: rank, then affected as a tiebreak
  return (
    SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
    a.affectedUsage - b.affectedUsage
  );
}

export function FeatureTable({
  features,
  filter = null,
  onFilterChange,
}: {
  features: FeatureFinding[];
  filter?: Severity | null;
  onFilterChange?: (severity: Severity | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("severity");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const setFilter = (s: Severity | null) => onFilterChange?.(s);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = filterBySeverity(features, filter).filter(
      (f) =>
        !q ||
        f.title.toLowerCase().includes(q) ||
        f.featureId.toLowerCase().includes(q),
    );
    const sorted = [...base].sort((a, b) => compare(a, b, sortKey));
    return sortDir === "asc" ? sorted : sorted.reverse();
  }, [features, filter, query, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  // Reset to the first page whenever the result set changes shape.
  useEffect(() => {
    setPage(0);
  }, [filter, query, sortKey, sortDir]);

  const current = Math.min(page, pageCount - 1);
  const start = current * PAGE_SIZE;
  const visible = rows.slice(start, start + PAGE_SIZE);

  const chip = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-sm transition-colors duration-150 ${
      active
        ? "bg-accent text-[color:var(--color-on-accent)] font-medium"
        : "border border-line text-muted hover:text-fg hover:border-line-strong"
    }`;

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(DEFAULT_DIR[key]);
    }
  };

  const SortHead = ({
    label,
    keyName,
    className = "",
  }: {
    label: string;
    keyName: SortKey;
    className?: string;
  }) => {
    const active = sortKey === keyName;
    return (
      <th className={`pb-3 font-medium ${className}`}>
        <button
          onClick={() => toggleSort(keyName)}
          className={`inline-flex items-center gap-1 transition-colors hover:text-fg ${
            active ? "text-fg" : ""
          }`}
        >
          {label}
          {active &&
            (sortDir === "asc" ? (
              <CaretUp size={11} weight="bold" />
            ) : (
              <CaretDown size={11} weight="bold" />
            ))}
        </button>
      </th>
    );
  };

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-medium">
          Detected features{" "}
          <span className="font-mono text-sm text-muted">
            ({rows.length})
          </span>
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <MagnifyingGlass
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search features"
              aria-label="Search features"
              className="h-9 w-40 rounded-full border border-line bg-surface-2/50 pl-9 pr-3 text-sm text-fg placeholder:text-faint transition-colors focus:border-line-strong focus:outline-none focus:ring-1 focus:ring-accent/40 sm:w-48"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button className={chip(!filter)} onClick={() => setFilter(null)}>
              All
            </button>
            {SEVERITY_ORDER.map((s) => (
              <button
                key={s}
                className={chip(filter === s)}
                onClick={() => setFilter(s)}
              >
                {SEVERITY_LABEL[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-faint">
              <SortHead label="Severity" keyName="severity" className="pr-4" />
              <SortHead label="Feature" keyName="feature" className="pr-4" />
              <SortHead label="Affected" keyName="affected" className="pr-4" />
              <th className="pb-3 pr-4 font-medium">Missing in</th>
              <th className="pb-3 font-medium sr-only">Details</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((f) => {
              const isOpen = expanded === f.featureId;
              return (
                <FeatureRow
                  key={f.featureId}
                  feature={f}
                  isOpen={isOpen}
                  reduce={Boolean(reduce)}
                  onToggle={() =>
                    setExpanded(isOpen ? null : f.featureId)
                  }
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          {query
            ? `No features match “${query}”.`
            : "No features match this filter."}
        </p>
      ) : (
        pageCount > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="text-xs text-muted">
              Showing <span className="tabular-nums text-fg">{start + 1}</span>-
              <span className="tabular-nums text-fg">
                {start + visible.length}
              </span>{" "}
              of <span className="tabular-nums text-fg">{rows.length}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(current - 1)}
                disabled={current === 0}
                aria-label="Previous page"
                className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] border border-line text-muted transition-colors hover:text-fg hover:border-line-strong active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-muted disabled:hover:border-line"
              >
                <CaretLeft size={15} weight="bold" />
              </button>
              <span className="font-mono text-xs tabular-nums text-muted">
                {current + 1} / {pageCount}
              </span>
              <button
                onClick={() => setPage(current + 1)}
                disabled={current >= pageCount - 1}
                aria-label="Next page"
                className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] border border-line text-muted transition-colors hover:text-fg hover:border-line-strong active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-muted disabled:hover:border-line"
              >
                <CaretRight size={15} weight="bold" />
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}

function FeatureRow({
  feature: f,
  isOpen,
  reduce,
  onToggle,
}: {
  feature: FeatureFinding;
  isOpen: boolean;
  reduce: boolean;
  onToggle: () => void;
}) {
  const locations = featureLocations(f);
  const fix = suggestFix(f);

  return (
    <>
      <tr
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`cursor-pointer border-t border-line transition-colors hover:bg-surface-2/40 ${
          isOpen ? "bg-surface-2/40" : ""
        }`}
      >
        <td className="py-3 pr-4">
          <span
            className="inline-flex items-center gap-2"
            style={{ color: SEVERITY_VAR[f.severity] }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: SEVERITY_VAR[f.severity] }}
            />
            {SEVERITY_LABEL[f.severity]}
          </span>
        </td>
        <td className="py-3 pr-4 font-mono text-fg">{f.title}</td>
        <td className="py-3 pr-4 tabular-nums text-muted">
          {f.affectedUsage}%
        </td>
        <td className="py-3 pr-4 text-muted">
          {f.missingIn.map((m) => `${m.name} ${m.version}`).join(", ") || "-"}
        </td>
        <td className="py-3 text-right">
          <CaretDown
            size={14}
            weight="bold"
            className={`inline text-faint transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </td>
      </tr>
      <AnimatePresence initial={false}>
        {isOpen && (
          <tr key="detail">
            <td colSpan={5} className="p-0">
              <motion.div
                initial={reduce ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden"
              >
                <div className="grid gap-5 border-t border-line bg-surface-2/30 p-4 lg:grid-cols-[1fr_1fr_1.2fr]">
                  <div>
                    <p className="text-sm leading-relaxed text-muted">
                      {featureDescription(f)}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-faint">
                      <FileHtml size={13} />
                      Found on {locations.length}{" "}
                      {locations.length === 1 ? "page" : "pages"}
                    </div>
                    <ul className="mt-1.5 flex flex-col gap-1">
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
                        <li className="text-xs text-muted">n/a</li>
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

                  <div>
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-faint">
                      <Wrench size={13} />
                      Suggested fix
                    </div>
                    <p className="mb-2 text-sm leading-relaxed text-muted">
                      {fix.advice}
                    </p>
                    {fix.snippet && <CopySnippet code={fix.snippet} />}
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}
