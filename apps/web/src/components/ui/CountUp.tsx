import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useReducedMotion,
} from "motion/react";

/**
 * Counts a number up from zero on mount. The motion communicates that the value
 * was just computed; under reduced motion it renders the final value instantly.
 * Driven by a motion value so it never re-renders the React tree per frame.
 */
export function CountUp({
  value,
  duration = 0.9,
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const text = useTransform(mv, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, {
      duration,
      ease: [0.23, 1, 0.32, 1],
    });
    return () => controls.stop();
  }, [value, duration, reduce, mv]);

  return <motion.span className={className}>{text}</motion.span>;
}
