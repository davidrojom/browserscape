import type { ImpactClass } from "./types.js";

/**
 * Per-class severity multiplier applied to a feature's raw usage share. A
 * feature missing on browsers worth X% of usage contributes `X * weight` to its
 * effective impact, which is what the severity thresholds are measured against.
 *
 * Because the cosmetic weight is 0.05, a purely cosmetic gap can never reach the
 * default `critical` band (5% effective impact) even if 100% of users lack it —
 * exactly the property that keeps `cursor`/`resize` out of the critical list.
 */
export const IMPACT_WEIGHTS: Record<ImpactClass, number> = {
  breaking: 1,
  degraded: 0.3,
  cosmetic: 0.05,
  none: 0,
};

/**
 * Default for any feature not enumerated below: a visible-but-usable
 * progressive-enhancement gap. Neither alarmist nor silent.
 */
export const DEFAULT_IMPACT: ImpactClass = "degraded";

/**
 * Breakage class per caniuse/doiuse feature id. Only the deviations from the
 * `degraded` default are listed; everything else falls through to
 * DEFAULT_IMPACT. This is the single source of truth for the editorial axis
 * that caniuse does not provide (it ships *who* lacks a feature, never *how
 * badly the page breaks* without it).
 *
 * none — guaranteed invisible with no signal worth showing, so the feature is
 *   dropped from the report entirely (see isHidden / analyzeCss). font-family
 *   value keywords are the canonical case: the property is a comma-separated
 *   fallback list, so the browser silently skips a keyword it doesn't know and
 *   resolves to the next entry. ui-sans-serif (Safari-only) and system-ui (old
 *   engines) cost nothing — frameworks like Tailwind ship them precisely
 *   because they fall through safely.
 *
 * cosmetic — the unsupported value is silently dropped with no layout or visual
 *   consequence: the cursor falls back to the default, a textarea is simply not
 *   user-resizable, the native scrollbar is shown. Worth surfacing as a
 *   low-priority note rather than hiding outright.
 *
 * breaking — layout, sizing, or a control genuinely falls apart when absent:
 *   grid/subgrid/flex-gap collapse, aspect-ratio boxes collapse, math-function
 *   and var() declarations become invalid, clip-path/mask/container-query
 *   layouts break.
 */
export const FEATURE_IMPACT: Record<string, ImpactClass> = {
  // none — hidden: guaranteed-invisible graceful fallback, no signal to report
  "extended-system-fonts": "none",
  "font-family-system-ui": "none",

  // cosmetic — graceful degradation, no layout/visual cost
  "css3-cursors": "cosmetic",
  "css3-cursors-newer": "cosmetic",
  "css3-cursors-grab": "cosmetic",
  "css-resize": "cosmetic",
  "css-scrollbar": "cosmetic",

  // breaking — layout / sizing / function depends on it
  "css-grid": "breaking",
  "css-subgrid": "breaking",
  "flexbox-gap": "breaking",
  "css-container-queries": "breaking",
  "css-container-query-units": "breaking",
  "css-aspect-ratio": "breaking",
  "css-math-functions": "breaking",
  "css-variables": "breaking",
  "css-clip-path": "breaking",
  "css-masks": "breaking",
  "css-writing-mode": "breaking",
};

/** Breakage class of a feature, defaulting to `degraded` when unmapped. */
export function impactOf(featureId: string): ImpactClass {
  return FEATURE_IMPACT[featureId] ?? DEFAULT_IMPACT;
}

/**
 * Whether a feature should be dropped from the report entirely. True only for
 * the `none` tier — gaps that are guaranteed invisible and carry no signal, so
 * reporting them would be a false positive.
 */
export function isHidden(featureId: string): boolean {
  return impactOf(featureId) === "none";
}

/** Usage share weighted by breakage class — the input to severity bucketing. */
export function effectiveImpact(
  affectedUsage: number,
  featureId: string,
): number {
  return affectedUsage * IMPACT_WEIGHTS[impactOf(featureId)];
}
