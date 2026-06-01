import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowClockwise,
  WarningCircle,
} from "@phosphor-icons/react";
import { analyze, ApiError, DEFAULT_API_BASE } from "../lib/api.js";
import type { AnalyzeResponse } from "../lib/types.js";
import { scoreVar, scoreVerdict, criticalFeatures } from "../lib/dashboard.js";
import { ScoreGauge } from "../components/ScoreGauge.js";
import { SeverityCards } from "../components/SeverityCards.js";
import { CriticalList } from "../components/CriticalList.js";
import { FeatureTable } from "../components/FeatureTable.js";
import { BrowserBars } from "../components/BrowserBars.js";
import { PageBreakdown } from "../components/PageBreakdown.js";
import { Recommendations } from "../components/Recommendations.js";
import { CategoryBreakdown } from "../components/CategoryBreakdown.js";
import { CompatibilityMatrix } from "../components/CompatibilityMatrix.js";
import { ReportMeta } from "../components/ReportMeta.js";
import { ReportActions } from "../components/ReportActions.js";
import { DashboardSkeleton } from "../components/dashboard/DashboardSkeleton.js";
import { Reveal } from "../components/ui/Reveal.js";
import { CountUp } from "../components/ui/CountUp.js";
import { UrlForm } from "../components/ui/UrlForm.js";
import { Wordmark } from "../components/ui/Wordmark.js";
import type { Severity } from "../lib/types.js";

export interface AnalysisSearch {
  url?: string;
}

export const Route = createFileRoute("/analysis")({
  validateSearch: (search): AnalysisSearch => ({
    url: typeof search.url === "string" ? search.url : undefined,
  }),
  component: AnalysisPage,
});

type Status = "idle" | "loading" | "error" | "success";

function AnalysisPage() {
  const { url } = Route.useSearch();
  const [status, setStatus] = useState<Status>(url ? "loading" : "idle");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!url) {
      setStatus("idle");
      return;
    }
    let ignore = false;
    setStatus("loading");
    setError(null);
    analyze(url, { apiBase: DEFAULT_API_BASE }, { maxDepth: 1, maxPages: 25 })
      .then((res) => {
        if (ignore) return;
        setData(res);
        setStatus("success");
      })
      .catch((e) => {
        if (ignore) return;
        setError(e instanceof ApiError ? e.message : "Analysis failed");
        setStatus("error");
      });
    return () => {
      ignore = true;
    };
  }, [url, attempt]);

  return (
    <div className="min-h-[100dvh]">
      <ResultsHeader
        url={url}
        score={status === "success" ? data?.report.overallScore : undefined}
      />
      <main className="mx-auto max-w-6xl px-5 py-8">
        {status === "idle" && <IdleState />}
        {status === "loading" && <LoadingState url={url} />}
        {status === "error" && (
          <ErrorState
            message={error ?? "Something went wrong."}
            onRetry={() => setAttempt((a) => a + 1)}
          />
        )}
        {status === "success" && data && <Report data={data} />}
      </main>
    </div>
  );
}

function ResultsHeader({ url, score }: { url?: string; score?: number }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link
          to="/"
          data-umami-event="analysis-back-home"
          className="group flex shrink-0 items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft
            size={16}
            weight="bold"
            className="transition-transform group-hover:-translate-x-0.5"
          />
          <span className="hidden sm:block">
            <Wordmark size={16} />
          </span>
        </Link>

        {url && (
          <span className="min-w-0 flex-1 truncate text-center font-mono text-sm text-muted">
            {url.replace(/^https?:\/\//, "")}
          </span>
        )}

        {typeof score === "number" ? (
          <span
            className="flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-sm"
            style={{
              color: scoreVar(score),
              borderColor: "var(--color-line)",
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: scoreVar(score) }}
            />
            {score}
          </span>
        ) : (
          <span className="w-[80px] shrink-0" />
        )}
      </div>
    </header>
  );
}

function SummaryBand({ data }: { data: AnalyzeResponse }) {
  const critical = criticalFeatures(data.report.features).length;
  const worst = [...data.report.byBrowser].sort(
    (a, b) => a.supportRatio - b.supportRatio,
  )[0];
  const stats: { label: string; num?: number; text?: string }[] = [
    { label: "Pages analyzed", num: data.pagesAnalyzed },
    { label: "Features flagged", num: data.report.features.length },
    { label: "Critical", num: critical },
    {
      label: "Weakest engine",
      text: worst ? `${worst.browser.name} ${worst.browser.version}` : "-",
    },
  ];
  return (
    <div className="grid gap-5 rounded-[var(--radius-card)] border border-line bg-surface p-6 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-10">
      <ScoreGauge score={data.report.overallScore} />
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 lg:grid-cols-4 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="font-mono text-2xl font-semibold tabular-nums text-fg">
              {typeof s.num === "number" ? (
                <CountUp value={s.num} />
              ) : (
                s.text
              )}
            </div>
            <div className="mt-1 text-xs text-muted">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Report({ data }: { data: AnalyzeResponse }) {
  const [severity, setSeverity] = useState<Severity | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const selectSeverity = (next: Severity | null) => {
    setSeverity(next);
    if (next) {
      tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-medium">Compatibility report</h1>
            <p className="text-sm text-muted">
              Hand the findings to a coding agent to fix them in one pass.
            </p>
          </div>
          <ReportActions data={data} />
        </div>
      </Reveal>
      <Reveal delay={0.04}>
        <SummaryBand data={data} />
      </Reveal>
      <Reveal delay={0.05}>
        <SeverityCards
          counts={data.report.bySeverity}
          active={severity}
          onSelect={selectSeverity}
        />
      </Reveal>
      <Reveal delay={0.06}>
        <Recommendations features={data.report.features} />
      </Reveal>
      <div className="grid gap-5 lg:grid-cols-2">
        <Reveal delay={0.1}>
          <CriticalList features={data.report.features} />
        </Reveal>
        <Reveal delay={0.12}>
          <BrowserBars
            byBrowser={data.report.byBrowser}
            features={data.report.features}
          />
        </Reveal>
      </div>
      <Reveal delay={0.1} className="scroll-mt-20">
        <div ref={tableRef}>
          <FeatureTable
            features={data.report.features}
            filter={severity}
            onFilterChange={setSeverity}
          />
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <CompatibilityMatrix
          features={data.report.features}
          browsers={data.report.targetBrowsers}
        />
      </Reveal>
      <div className="grid gap-5 lg:grid-cols-2">
        <Reveal delay={0.1}>
          <CategoryBreakdown features={data.report.features} />
        </Reveal>
        <Reveal delay={0.12}>
          <PageBreakdown pages={data.perPage} />
        </Reveal>
      </div>
      <Reveal delay={0.1}>
        <ReportMeta data={data} />
      </Reveal>
    </div>
  );
}

const PHASES = [
  "Fetching the page",
  "Crawling linked pages",
  "Parsing stylesheets",
  "Resolving browser support",
  "Scoring compatibility",
];

function LoadingState({ url }: { url?: string }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(
      () => setPhase((p) => Math.min(p + 1, PHASES.length - 1)),
      1100,
    );
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-surface px-5 py-4">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          {!reduce && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          )}
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
        </span>
        <div className="min-w-0">
          <motion.div
            key={phase}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-sm font-medium text-fg"
          >
            {PHASES[phase]}
            <span className="text-muted">…</span>
          </motion.div>
          {url && (
            <div className="truncate font-mono text-xs text-faint">
              {url.replace(/^https?:\/\//, "")}
            </div>
          )}
        </div>
      </div>
      <DashboardSkeleton />
    </div>
  );
}

function IdleState() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-20 text-center">
      <Wordmark size={24} />
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        Run a compatibility report
      </h1>
      <p className="mt-2 text-muted">
        Enter a URL to crawl its pages and score CSS support across browsers.
      </p>
      <div className="mt-8 flex w-full justify-center">
        <UrlForm size="lg" autoFocus />
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full border border-broken/40 bg-[rgba(255,107,94,0.08)]">
        <WarningCircle size={28} weight="fill" className="text-broken" />
      </span>
      <h1 className="mt-5 text-xl font-medium">Analysis failed</h1>
      <p className="mt-2 text-muted">{message}</p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={onRetry}
          data-umami-event="analysis-retry"
          className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-control)] bg-accent px-5 font-medium text-[color:var(--color-on-accent)] transition-[transform,background-color] duration-150 hover:bg-accent-hi active:scale-[0.97]"
        >
          <ArrowClockwise size={16} weight="bold" />
          Try again
        </button>
        <Link
          to="/"
          data-umami-event="analysis-new-url"
          className="inline-flex h-11 items-center rounded-[var(--radius-control)] border border-line px-5 text-muted transition-colors hover:text-fg"
        >
          New URL
        </Link>
      </div>
    </div>
  );
}
