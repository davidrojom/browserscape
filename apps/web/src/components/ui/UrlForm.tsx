import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "@phosphor-icons/react";

function normalizeUrl(raw: string): string {
  const v = raw.trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

const EXAMPLES = ["stripe.com", "linear.app", "github.com"];

/**
 * The single primary action of the whole site: enter a URL, get an analysis.
 * Example chips let visitors try it in one click. Reused in hero + closing CTA.
 */
export function UrlForm({
  size = "lg",
  autoFocus = false,
  showExamples = true,
}: {
  size?: "lg" | "md";
  autoFocus?: boolean;
  showExamples?: boolean;
}) {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);

  const url = normalizeUrl(value);
  const invalid = touched && value.trim().length > 0 && !url;

  function go(target: string) {
    const u = normalizeUrl(target);
    if (!u) return;
    navigate({ to: "/analysis", search: { url: u } });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    go(value);
  }

  const h = size === "lg" ? "h-14" : "h-12";

  return (
    <div className="w-full max-w-xl">
      <form onSubmit={submit}>
        <div
          className={`group flex items-center rounded-[var(--radius-control)] border border-line bg-surface pl-4 pr-1.5 ${h} transition-colors duration-200 focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(198,242,78,0.12)]`}
        >
          <span className="mr-2 select-none font-mono text-sm text-faint">https://</span>
          <input
            autoFocus={autoFocus}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
            inputMode="url"
            aria-label="Website URL to analyze"
            aria-invalid={invalid}
            placeholder="yourdomain.com"
            className="min-w-0 flex-1 bg-transparent font-mono text-fg placeholder:text-faint focus:outline-none"
          />
          <button
            type="submit"
            data-umami-event="analyze-submit"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[8px] bg-accent px-4 font-medium text-[color:var(--color-on-accent)] transition-[transform,background-color] duration-150 ease-[var(--ease-out-strong)] hover:bg-accent-hi active:scale-[0.97]"
          >
            Analyze
            <ArrowRight size={16} weight="bold" className="hidden sm:block" />
          </button>
        </div>
      </form>

      <div className="mt-3 flex min-h-6 flex-wrap items-center gap-2">
        {invalid ? (
          <p className="font-mono text-sm text-broken" role="alert">
            Enter a valid web address, e.g. stripe.com
          </p>
        ) : showExamples ? (
          <>
            <span className="font-mono text-xs text-faint">try</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => go(ex)}
                data-umami-event="analyze-example"
                data-umami-event-domain={ex}
                className="rounded-full border border-line px-2.5 py-1 font-mono text-xs text-muted transition-colors duration-150 hover:border-accent hover:text-accent"
              >
                {ex}
              </button>
            ))}
          </>
        ) : null}
      </div>
    </div>
  );
}
