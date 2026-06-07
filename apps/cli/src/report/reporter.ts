import chalk from "chalk";
import Table from "cli-table3";
import type { CompatibilityReport, Severity } from "@browserscape/core";

const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Critico",
  important: "Importante",
  medium: "Medio",
  low: "Bajo",
};

const SEVERITY_COLOR: Record<Severity, (s: string) => string> = {
  critical: chalk.red.bold,
  important: chalk.yellow.bold,
  medium: chalk.cyan,
  low: chalk.gray,
};

export function formatReport(
  report: CompatibilityReport,
  meta: { pages: number },
): string {
  const lines: string[] = [];
  lines.push(chalk.bold(`\nBrowserscape report`));
  lines.push(`Pages analyzed: ${meta.pages}`);
  lines.push(
    `Overall compatibility: ${chalk.bold(String(report.overallScore))}/100`,
  );
  lines.push("");
  lines.push(
    `Critico: ${report.bySeverity.critical}  ` +
      `Importante: ${report.bySeverity.important}  ` +
      `Medio: ${report.bySeverity.medium}  ` +
      `Bajo: ${report.bySeverity.low}`,
  );

  if (report.features.length > 0) {
    const table = new Table({
      head: ["Severity", "Feature", "Affected %", "Missing in"],
    });
    for (const f of report.features) {
      table.push([
        SEVERITY_COLOR[f.severity](SEVERITY_LABEL[f.severity]),
        f.title,
        `${f.affectedUsage}%`,
        f.missingIn.map((m) => `${m.name} ${m.version}`).join(", ") || "-",
      ]);
    }
    lines.push("", table.toString());
  } else {
    lines.push("", chalk.green("No compatibility issues found."));
  }

  return lines.join("\n");
}
