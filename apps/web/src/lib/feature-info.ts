import type { FeatureFinding } from "./types.js";

/**
 * Plain-language explanations of what each detected feature does, keyed by the
 * caniuse/doiuse feature id. caniuse-lite ships titles but not descriptions, so
 * this curated map covers the CSS features doiuse flags most often. Anything
 * not listed falls back to a generated sentence from the feature title.
 */
export const FEATURE_DESCRIPTIONS: Record<string, string> = {
  "css-has":
    "The :has() relational pseudo-class lets a selector style an element based on its descendants. It is the long-awaited parent selector.",
  "css-subgrid":
    "subgrid lets a nested grid align its tracks to the parent grid instead of defining its own, keeping complex layouts aligned.",
  "css-container-queries":
    "Container queries style an element based on the size of its container rather than the viewport, enabling truly modular components.",
  "css-container-query-units":
    "Container query length units (cqw, cqh, cqi, cqb) size content relative to a query container instead of the viewport.",
  "css-color-mix":
    "color-mix() blends two colors in a given color space, useful for deriving tints, shades and theme variations on the fly.",
  "css-text-wrap-balance":
    "text-wrap: balance evens out the number of characters per line in short text blocks like headings for tidier wrapping.",
  "css-nesting":
    "Native CSS nesting lets you write nested rules without a preprocessor, scoping declarations to a parent selector.",
  "css-cascade-layers":
    "Cascade layers (@layer) give you explicit control over specificity ordering across groups of styles.",
  "css-grid":
    "CSS Grid is a two-dimensional layout system for arranging content into rows and columns.",
  "flexbox-gap":
    "The gap property in flexbox adds consistent spacing between flex items without margins.",
  "css-aspect-ratio":
    "aspect-ratio sets a preferred width-to-height ratio for a box, reserving space and preventing layout shift.",
  "css-sticky":
    "position: sticky keeps an element pinned within its scroll container once it reaches a given offset.",
  "css-scroll-behavior":
    "scroll-behavior: smooth animates scrolling between anchor positions instead of jumping instantly.",
  "css-snappoints":
    "CSS scroll snapping locks scrolling to defined positions, used for carousels and paged layouts.",
  "css-backdrop-filter":
    "backdrop-filter applies graphical effects like blur to the area behind an element, for frosted-glass surfaces.",
  "css-variables":
    "CSS custom properties (variables) store reusable values that cascade and can be updated at runtime.",
  "css-clip-path":
    "clip-path crops an element to a shape, hiding everything outside the defined region.",
  "css-filters":
    "CSS filters apply graphical effects such as blur, brightness and contrast directly to an element.",
  "css-masks":
    "CSS masking hides or reveals parts of an element using an image or gradient as an alpha mask.",
  "css-logical-props":
    "Logical properties (inline/block) adapt margins, padding and borders to the writing direction automatically.",
  "css-math-functions":
    "Math functions like min(), max() and clamp() compute responsive values directly in CSS.",
  "css-overflow-anchor":
    "Overflow anchoring keeps the visible scroll position stable when content above it changes size.",
  "css-text-orientation":
    "text-orientation controls the orientation of characters in vertical writing modes.",
  "css-writing-mode":
    "writing-mode sets whether text flows horizontally or vertically, for vertical scripts and rotated labels.",
  "css-when-else":
    "Conditional rules let styles apply only when given feature or media conditions are met.",
  "css3-cursors":
    "Extended cursor keywords give richer pointer feedback for interactive elements.",
  "css-appearance":
    "appearance controls whether an element uses native OS styling for form controls.",
  "css-touch-action":
    "touch-action declares which touch gestures the browser handles versus your own scripts.",
  "css-scrollbar":
    "Scrollbar styling properties let you restyle the size and color of scrollbars.",
  "css-overscroll-behavior":
    "overscroll-behavior controls scroll chaining and bounce when a scroll container reaches its edge.",
  "css-gradients":
    "CSS gradients render smooth color transitions as background images without bitmap assets.",
  "css-font-rendering-controls":
    "font-display controls how a web font is shown while it loads, avoiding invisible text.",
  "css-content-visibility":
    "content-visibility: auto skips rendering off-screen content to speed up page load.",
  "mdn-css-unicode-bidi-isolate":
    "Bidirectional isolation keeps mixed-direction text from disturbing the layout around it.",
  "css-text-indent":
    "Advanced text-indent values control first-line indentation, including hanging indents.",
};

/**
 * Fix guidance per feature: an optional @supports condition to feature-detect
 * against, plus a one-line strategy. Keyed by feature id; unknown features get
 * a generic progressive-enhancement note.
 */
interface FeatureFix {
  /** Condition to place inside `@supports (...)`. Omitted when no clean test exists. */
  supports?: string;
  advice: string;
}

const FEATURE_FIXES: Record<string, FeatureFix> = {
  "css-has": {
    supports: "selector(:has(*))",
    advice:
      "Guard :has() rules behind @supports and ship a class-based fallback (toggle a class with JS) for engines without it.",
  },
  "css-subgrid": {
    supports: "(grid-template-columns: subgrid)",
    advice:
      "Provide an explicit grid track fallback outside the @supports block so the layout still aligns without subgrid.",
  },
  "css-container-queries": {
    supports: "(container-type: inline-size)",
    advice:
      "Keep a viewport media-query layout as the baseline and layer container queries on top inside @supports.",
  },
  "css-container-query-units": {
    supports: "(width: 1cqi)",
    advice:
      "Fall back to vw/vh or fixed sizes; only switch to cq units inside the @supports block.",
  },
  "css-color-mix": {
    supports: "(color: color-mix(in oklab, red, blue))",
    advice:
      "Declare a static fallback color first, then override it with color-mix() inside @supports.",
  },
  "css-text-wrap-balance": {
    advice:
      "text-wrap: balance degrades gracefully; no guard needed, text simply wraps normally where it is unsupported.",
  },
  "css-nesting": {
    supports: "selector(& > *)",
    advice:
      "Compile nesting with a build step (Lightning CSS or PostCSS) so older engines receive flattened rules.",
  },
  "css-cascade-layers": {
    supports: "(at-rule(@layer))",
    advice:
      "Order your stylesheets carefully as a fallback; @layer only changes precedence where supported.",
  },
  "css-backdrop-filter": {
    supports: "(backdrop-filter: blur(1px))",
    advice:
      "Use a solid or semi-opaque background as the baseline, then enhance with backdrop-filter inside @supports.",
  },
  "css-aspect-ratio": {
    supports: "(aspect-ratio: 1)",
    advice:
      "Reserve space with the padding-top percentage trick as a fallback for engines without aspect-ratio.",
  },
  "flexbox-gap": {
    supports: "(gap: 1px)",
    advice:
      "Fall back to margins on flex children where flex gap is unsupported.",
  },
  "css-sticky": {
    supports: "(position: sticky)",
    advice:
      "Treat position: sticky as progressive enhancement; the element stays in normal flow without it.",
  },
};

/** Broad area of CSS a feature belongs to, for grouping in the report. */
export type FeatureCategory =
  | "Layout"
  | "Selectors & nesting"
  | "Color"
  | "Typography"
  | "Visual effects"
  | "Interaction & scroll"
  | "Other";

const CATEGORY_BY_ID: Record<string, FeatureCategory> = {
  "css-grid": "Layout",
  "css-subgrid": "Layout",
  "flexbox-gap": "Layout",
  "css-container-queries": "Layout",
  "css-container-query-units": "Layout",
  "css-aspect-ratio": "Layout",
  "css-sticky": "Layout",
  "css-logical-props": "Layout",
  "css-writing-mode": "Layout",
  "css-math-functions": "Layout",
  "css-has": "Selectors & nesting",
  "css-nesting": "Selectors & nesting",
  "css-cascade-layers": "Selectors & nesting",
  "css-when-else": "Selectors & nesting",
  "css-color-mix": "Color",
  "css-gradients": "Color",
  "css-variables": "Color",
  "css-text-wrap-balance": "Typography",
  "css-text-orientation": "Typography",
  "css-text-indent": "Typography",
  "css-font-rendering-controls": "Typography",
  "mdn-css-unicode-bidi-isolate": "Typography",
  "css-backdrop-filter": "Visual effects",
  "css-filters": "Visual effects",
  "css-masks": "Visual effects",
  "css-clip-path": "Visual effects",
  "css-content-visibility": "Visual effects",
  "css-scroll-behavior": "Interaction & scroll",
  "css-snappoints": "Interaction & scroll",
  "css-touch-action": "Interaction & scroll",
  "css-overscroll-behavior": "Interaction & scroll",
  "css-scrollbar": "Interaction & scroll",
  "css-overflow-anchor": "Interaction & scroll",
  "css3-cursors": "Interaction & scroll",
  "css-appearance": "Interaction & scroll",
};

/** The CSS area a feature belongs to. Falls back to "Other" when unknown. */
export function featureCategory(feature: FeatureFinding): FeatureCategory {
  return CATEGORY_BY_ID[feature.featureId] ?? "Other";
}

/** What the detected feature does, in plain language. */
export function featureDescription(feature: FeatureFinding): string {
  const known = FEATURE_DESCRIPTIONS[feature.featureId];
  if (known) return known;
  return `${feature.title} is a modern CSS feature that is not yet supported across all of your target browsers.`;
}

/** A short fix strategy plus an optional @supports snippet for this feature. */
export function suggestFix(feature: FeatureFinding): {
  advice: string;
  snippet?: string;
} {
  const fix = FEATURE_FIXES[feature.featureId];
  if (fix?.supports) {
    return {
      advice: fix.advice,
      snippet: `@supports ${fix.supports} {\n  /* ${feature.title} styles here */\n}`,
    };
  }
  if (fix) return { advice: fix.advice };
  return {
    advice:
      "Wrap the feature in an @supports block and provide a baseline fallback so unsupported browsers still render correctly.",
  };
}

/**
 * Unique, human-readable locations where a feature was seen. Origins arrive as
 * page URLs (with a #sheet-N fragment for inline styles) or stylesheet URLs;
 * the fragment is stripped and duplicates collapsed for display.
 */
export function featureLocations(feature: FeatureFinding): string[] {
  const seen = new Set<string>();
  for (const o of feature.occurrences) {
    seen.add(o.origin.replace(/#sheet-\d+$/, ""));
  }
  return [...seen];
}
