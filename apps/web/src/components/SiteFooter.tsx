import { Wordmark } from "./ui/Wordmark.js";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-10 sm:flex-row sm:items-center">
        <Wordmark />
        <p className="max-w-[42ch] text-sm leading-relaxed text-muted">
          CSS browser-compatibility analysis backed by Baseline and caniuse
          support data.
        </p>
        <span className="font-mono text-xs text-faint">© 2026</span>
      </div>
    </footer>
  );
}
