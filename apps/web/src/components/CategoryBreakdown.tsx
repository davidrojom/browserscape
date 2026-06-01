import { SEVERITY_ORDER, SEVERITY_VAR } from "../lib/dashboard.js";
import { featureCategory, type FeatureCategory } from "../lib/feature-info.js";
import type { FeatureFinding, Severity } from "../lib/types.js";

interface Group {
  category: FeatureCategory;
  total: number;
  bySeverity: Record<Severity, number>;
}

function group(features: FeatureFinding[]): Group[] {
  const map = new Map<FeatureCategory, Group>();
  for (const f of features) {
    const cat = featureCategory(f);
    let g = map.get(cat);
    if (!g) {
      g = { category: cat, total: 0, bySeverity: { critico: 0, importante: 0, medio: 0, bajo: 0 } };
      map.set(cat, g);
    }
    g.total++;
    g.bySeverity[f.severity]++;
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function CategoryBreakdown({ features }: { features: FeatureFinding[] }) {
  const groups = group(features);
  const max = Math.max(1, ...groups.map((g) => g.total));

  if (features.length === 0) return null;

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 className="text-base font-medium">Issues by category</h2>
        <span className="text-xs text-muted">Where the gaps cluster</span>
      </div>
      <p className="mb-4 text-sm text-muted">
        Detected features grouped by the area of CSS they belong to.
      </p>

      <ul className="flex flex-col gap-3.5">
        {groups.map((g) => (
          <li key={g.category} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm text-fg">{g.category}</span>
              <span className="font-mono text-sm tabular-nums text-muted">
                {g.total}
              </span>
            </div>
            {/* severity-composed bar: each segment sized by its share of the row */}
            <span
              className="flex h-2 overflow-hidden rounded-full bg-line"
              style={{ width: `${(g.total / max) * 100}%`, minWidth: "8%" }}
            >
              {SEVERITY_ORDER.map((s) =>
                g.bySeverity[s] > 0 ? (
                  <span
                    key={s}
                    className="h-full first:rounded-l-full last:rounded-r-full"
                    style={{
                      flexGrow: g.bySeverity[s],
                      background: SEVERITY_VAR[s],
                    }}
                    title={`${g.bySeverity[s]} ${s}`}
                  />
                ) : null,
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
