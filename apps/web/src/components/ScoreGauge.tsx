import { motion, useReducedMotion } from "motion/react";
import { scoreVar, scoreVerdict } from "../lib/dashboard.js";
import { CountUp } from "./ui/CountUp.js";

export function ScoreGauge({
  score,
  size = 168,
}: {
  score: number;
  size?: number;
}) {
  const reduce = useReducedMotion();
  const stroke = size < 140 ? 10 : 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const color = scoreVar(score);

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-line)"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={reduce ? false : { strokeDashoffset: c }}
            whileInView={{ strokeDashoffset: c * (1 - pct) }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.23, 1, 0.32, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-mono font-semibold tabular-nums"
            style={{ color, fontSize: size * 0.3 }}
          >
            <CountUp value={score} duration={1.1} />
          </span>
          <span className="text-xs text-faint">/ 100</span>
        </div>
      </div>
      <div>
        <div className="text-sm text-muted">Compatibility score</div>
        <div className="mt-1 text-lg font-medium" style={{ color }}>
          {scoreVerdict(score)}
        </div>
        <p className="mt-2 max-w-[28ch] text-sm leading-relaxed text-muted">
          Weighted across detected features and their real-world browser
          support.
        </p>
      </div>
    </div>
  );
}
