import type { AnalyzeResponse, FeatureFinding } from "./types.js";
import { SEVERITY_ORDER, SEVERITY_LABEL } from "./dashboard.js";
import {
  featureDescription,
  featureLocations,
  suggestFix,
} from "./feature-info.js";

function featureBlock(f: FeatureFinding): string {
  const missing =
    f.missingIn.map((m) => `${m.name} ${m.version}`).join(", ") || "n/a";
  const locations = featureLocations(f);
  const where =
    locations.length > 0
      ? locations.map((l) => `    - ${l}`).join("\n")
      : "    - (location not reported)";
  const fix = suggestFix(f);
  const lines = [
    `### ${f.title} [${SEVERITY_LABEL[f.severity]}]`,
    `- What it does: ${featureDescription(f)}`,
    `- Fails in: ${missing}`,
    `- Affected traffic: ${f.affectedUsage}%`,
    `- Suggested fix: ${fix.advice}`,
    `- Found in:`,
    where,
  ];
  return lines.join("\n");
}

/**
 * Builds a self-contained prompt describing every flagged feature, the browsers
 * it breaks in and the pages it appears on, ready to hand to a coding agent.
 */
export function buildFixPrompt(data: AnalyzeResponse): string {
  const { report } = data;
  const targets = report.targetBrowsers
    .map((b) => `${b.name} ${b.version}`)
    .join(", ");

  // Most severe and most-impactful first.
  const ordered = [...report.features].sort((a, b) => {
    const s =
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
    return s !== 0 ? s : b.affectedUsage - a.affectedUsage;
  });

  const header = [
    `I ran a browser-compatibility audit on ${data.url} and need help fixing the issues.`,
    "",
    `- Pages analyzed: ${data.pagesAnalyzed}`,
    `- Overall compatibility score: ${report.overallScore}/100`,
    `- Target browsers: ${targets}`,
    "",
    `Below are the ${ordered.length} CSS features that are not fully supported across these targets. For each one, please suggest a fix (a progressive-enhancement fallback, an @supports guard, or a polyfill) that keeps the page working in the browsers listed under "Fails in". Edit the relevant files where each feature is used.`,
    "",
    "## Issues",
    "",
  ].join("\n");

  if (ordered.length === 0) {
    return `${header}No compatibility issues were detected. 🎉\n`;
  }

  return `${header}${ordered.map(featureBlock).join("\n\n")}\n`;
}
