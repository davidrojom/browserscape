import chalk from "chalk";
import Table from "cli-table3";
import type { CompatibilityReport, Severity } from "@browserscape/core";

const SEVERITY_LABEL: Record<Severity, string> = {
  critico: "Critico",
  importante: "Importante",
  medio: "Medio",
  bajo: "Bajo",
};

const SEVERITY_COLOR: Record<Severity, (s: string) => string> = {
  critico: chalk.red.bold,
  importante: chalk.yellow.bold,
  medio: chalk.cyan,
  bajo: chalk.gray,
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
    `Critico: ${report.bySeverity.critico}  ` +
      `Importante: ${report.bySeverity.importante}  ` +
      `Medio: ${report.bySeverity.medio}  ` +
      `Bajo: ${report.bySeverity.bajo}`,
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
