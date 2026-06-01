import { useEffect, useState } from "react";
import { Copy, Check } from "@phosphor-icons/react";

/** A code block with a copy-to-clipboard affordance in the corner. */
export function CopySnippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      window.prompt("Copy snippet:", code);
    }
  };

  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-[var(--radius-control)] border border-line bg-bg p-3 pr-12 font-mono text-xs leading-relaxed text-muted">
        {code}
      </pre>
      <button
        onClick={onCopy}
        aria-label="Copy snippet"
        data-umami-event="copy-fix-snippet"
        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:text-fg hover:border-line-strong active:scale-[0.94]"
      >
        {copied ? (
          <Check size={13} weight="bold" className="text-ok" />
        ) : (
          <Copy size={13} />
        )}
      </button>
    </div>
  );
}
