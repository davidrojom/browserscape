import { SEVERITY_ORDER, SEVERITY_LABEL } from "../lib/dashboard.js";
import type { Severity } from "../lib/types.js";

export function SeverityCards({ counts }: { counts: Record<Severity, number> }) {
  return (
    <div className="grid">
      {SEVERITY_ORDER.map((s) => (
        <div className="panel sev-card" key={s}>
          <div className={`count sev-${s}`}>{counts[s]}</div>
          <div className="muted">{SEVERITY_LABEL[s]}</div>
        </div>
      ))}
    </div>
  );
}
