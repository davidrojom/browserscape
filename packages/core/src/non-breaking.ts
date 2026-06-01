/**
 * Feature IDs that static analysis (doiuse) reports as "unsupported" but which
 * never actually break a page, because the CSS property carries graceful
 * degradation in the spec itself: an unknown value is silently dropped and the
 * browser falls back. Flagging these is a false positive, so they are excluded
 * from findings, per-browser counts, and the overall score.
 *
 * font-family is the canonical case. It is a comma-separated fallback list and
 * the browser always resolves to *some* usable font, so a value keyword the
 * engine doesn't know costs nothing:
 *   - extended-system-fonts -> ui-serif / ui-sans-serif / ui-monospace /
 *     ui-rounded (Safari-only)
 *   - font-family-system-ui -> system-ui (unsupported on very old engines)
 * Frameworks like Tailwind ship exactly these keywords because they fall
 * through safely to the next entry in the stack.
 *
 * Keep this list narrow and principled: only add a feature when an unsupported
 * value is *guaranteed* to be ignored with no visual or layout consequence.
 * Progressive-enhancement features whose absence is actually visible (e.g.
 * text-wrap: balance, scroll-snap) do NOT belong here — those are real, if
 * low-severity, findings.
 */
export const NON_BREAKING_FEATURES: ReadonlySet<string> = new Set([
  "extended-system-fonts",
  "font-family-system-ui",
]);
