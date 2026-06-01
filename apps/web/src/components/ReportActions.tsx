import { useEffect, useState } from "react";
import {
  DownloadSimple,
  LinkSimple,
  Check,
} from "@phosphor-icons/react";
import { CopyPromptButton } from "./CopyPromptButton.js";
import type { AnalyzeResponse } from "../lib/types.js";

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "report";
  }
}

const ghost =
  "inline-flex h-10 shrink-0 items-center gap-2 rounded-[var(--radius-control)] border border-line bg-surface px-4 text-sm font-medium text-fg transition-[transform,background-color,border-color] duration-150 hover:border-line-strong hover:bg-surface-2 active:scale-[0.97]";

export function ReportActions({ data }: { data: AnalyzeResponse }) {
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (!linkCopied) return;
    const id = setTimeout(() => setLinkCopied(false), 2000);
    return () => clearTimeout(id);
  }, [linkCopied]);

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `browserscape-${hostnameOf(data.url)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
    } catch {
      window.prompt("Copy this report link:", window.location.href);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CopyPromptButton data={data} />
      <button
        onClick={downloadJson}
        data-umami-event="report-export-json"
        className={ghost}
      >
        <DownloadSimple size={16} />
        Export JSON
      </button>
      <button
        onClick={copyLink}
        aria-label="Copy a link to this report"
        data-umami-event="report-copy-link"
        className={ghost}
      >
        {linkCopied ? (
          <>
            <Check size={16} weight="bold" className="text-ok" />
            Link copied
          </>
        ) : (
          <>
            <LinkSimple size={16} />
            Copy link
          </>
        )}
      </button>
    </div>
  );
}
