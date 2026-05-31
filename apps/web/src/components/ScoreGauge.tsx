import { scoreColor } from "../lib/dashboard.js";

export function ScoreGauge({ score }: { score: number }) {
  return (
    <div className="panel">
      <div className="muted">Overall compatibility</div>
      <div className={`gauge ${scoreColor(score)}`}>{score}</div>
      <div className="muted">/ 100</div>
    </div>
  );
}
