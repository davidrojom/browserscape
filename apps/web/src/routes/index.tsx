import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { analyze, ApiError, DEFAULT_API_BASE } from "../lib/api.js";
import type { AnalyzeResponse } from "../lib/types.js";
import { ScoreGauge } from "../components/ScoreGauge.js";
import { SeverityCards } from "../components/SeverityCards.js";
import { CriticalList } from "../components/CriticalList.js";
import { FeatureTable } from "../components/FeatureTable.js";
import { BrowserBars } from "../components/BrowserBars.js";
import { PageBreakdown } from "../components/PageBreakdown.js";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyzeResponse | null>(null);

  async function onAnalyze() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyze(
        url.trim(),
        { apiBase: DEFAULT_API_BASE },
        { maxDepth: 1, maxPages: 25 },
      );
      setData(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Analysis failed");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="topbar">
        <h1>Browserscape</h1>
        <input
          value={url}
          placeholder="https://example.com"
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAnalyze()}
        />
        <button onClick={onAnalyze} disabled={loading}>
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </div>
      <div className="container">
        {error && <div className="panel error">{error}</div>}
        {!data && !error && (
          <p className="muted">
            Enter a public URL to analyze its CSS browser compatibility.
          </p>
        )}
        {data && (
          <>
            <div className="grid">
              <ScoreGauge score={data.report.overallScore} />
            </div>
            <SeverityCards counts={data.report.bySeverity} />
            <CriticalList features={data.report.features} />
            <FeatureTable features={data.report.features} />
            <BrowserBars byBrowser={data.report.byBrowser} />
            <PageBreakdown pages={data.perPage} />
          </>
        )}
      </div>
    </>
  );
}
