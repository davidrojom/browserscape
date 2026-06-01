import { useEffect, useState } from "react";
import { Copy, Check, Sparkle } from "@phosphor-icons/react";
import { buildFixPrompt } from "../lib/prompt.js";
import type { AnalyzeResponse } from "../lib/types.js";

export function CopyPromptButton({ data }: { data: AnalyzeResponse }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  const onCopy = async () => {
    const text = buildFixPrompt(data);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard API blocked (e.g. insecure context) — fall back to a prompt.
      window.prompt("Copy the AI fix prompt:", text);
    }
  };

  return (
    <button
      onClick={onCopy}
      aria-label="Copy an AI fix prompt with every issue and the pages it affects"
      data-umami-event="report-copy-ai-prompt"
      className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[var(--radius-control)] border border-line bg-surface px-4 text-sm font-medium text-fg transition-[transform,background-color,border-color] duration-150 hover:border-line-strong hover:bg-surface-2 active:scale-[0.97]"
    >
      {copied ? (
        <>
          <Check size={16} weight="bold" className="text-ok" />
          Prompt copied
        </>
      ) : (
        <>
          <span className="relative flex items-center">
            <Sparkle size={16} weight="fill" className="text-accent" />
          </span>
          Copy AI fix prompt
          <Copy size={15} className="text-muted" />
        </>
      )}
    </button>
  );
}
