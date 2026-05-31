import { useState } from "react";
import {
  SEVERITY_ORDER,
  SEVERITY_LABEL,
  filterBySeverity,
} from "../lib/dashboard.js";
import type { FeatureFinding, Severity } from "../lib/types.js";

export function FeatureTable({ features }: { features: FeatureFinding[] }) {
  const [filter, setFilter] = useState<Severity | null>(null);
  const rows = filterBySeverity(features, filter);
  return (
    <div className="panel">
      <h3>Feature ranking</h3>
      <div className="filters">
        <button className={!filter ? "active" : ""} onClick={() => setFilter(null)}>
          All
        </button>
        {SEVERITY_ORDER.map((s) => (
          <button
            key={s}
            className={filter === s ? "active" : ""}
            onClick={() => setFilter(s)}
          >
            {SEVERITY_LABEL[s]}
          </button>
        ))}
      </div>
      <table>
        <thead>
          <tr>
            <th>Severity</th>
            <th>Feature</th>
            <th>Affected %</th>
            <th>Missing in</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((f) => (
            <tr key={f.featureId}>
              <td className={`sev-${f.severity}`}>{SEVERITY_LABEL[f.severity]}</td>
              <td>{f.title}</td>
              <td>{f.affectedUsage}%</td>
              <td>
                {f.missingIn.map((m) => `${m.name} ${m.version}`).join(", ") ||
                  "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="muted">No features for this filter.</p>}
    </div>
  );
}
