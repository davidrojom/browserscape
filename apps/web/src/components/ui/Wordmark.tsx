/**
 * Distinctive mark: a viewport/scan frame (two corner brackets) plus a mono
 * wordmark with a terminal-style accent cursor. The bracket is a single
 * simple geometric mark, not a hand-drawn illustration.
 */
export function Wordmark({ size = 18 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
        className="text-accent"
      >
        <path
          d="M2 6V2h4M18 14v4h-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
        />
        <rect x="7" y="7" width="6" height="6" rx="1" fill="currentColor" />
      </svg>
      <span className="font-mono text-[15px] font-medium lowercase tracking-tight text-fg">
        browserscape
        <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-accent align-baseline" />
      </span>
    </span>
  );
}
