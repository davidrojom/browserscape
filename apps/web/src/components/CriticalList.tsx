import { criticalFeatures } from "../lib/dashboard.js";
import type { FeatureFinding } from "../lib/types.js";

export function CriticalList({ features }: { features: FeatureFinding[] }) {
  const critical = criticalFeatures(features);
  return (
    <div className="panel">
      <h3>Critical properties</h3>
      {critical.length === 0 ? (
        <p className="muted">No critical incompatibilities.</p>
      ) : (
        <ul>
          {critical.map((f) => (
            <li key={f.featureId}>
              <strong>{f.title}</strong> — missing in{" "}
              {f.missingIn.map((m) => `${m.name} ${m.version}`).join(", ")} (
              {f.affectedUsage}% affected)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
