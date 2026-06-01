import type { CSSProperties } from "react";
import { UrlForm } from "../ui/UrlForm.js";
import { ReportPreview } from "./ReportPreview.js";

export function Hero() {
  // CSS-driven entrance (see .hero-rise). Visible without JS, no FOUC.
  const rise = (i: number) => ({
    style: { "--rise-delay": `${i * 80}ms` } as CSSProperties,
  });

  return (
    <section className="relative overflow-hidden">
      <div className="grid-scape pointer-events-none absolute inset-0" />
      <div className="glow-accent pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-bg" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 pb-16 pt-12 sm:gap-12 sm:pb-20 sm:pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12 lg:pb-28 lg:pt-24">
        <div className="max-w-xl">
          <div
            {...rise(0)}
            className="hero-rise inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-accent"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            CSS compatibility scanner
          </div>

          <h1
            {...rise(1)}
            className="hero-rise mt-5 text-[2.25rem] font-semibold leading-[1.06] tracking-[-0.02em] sm:text-5xl sm:leading-[1.04] lg:text-[3.5rem]"
          >
            It works on your machine.
            <br />
            <span className="text-muted">Browserscape checks</span>{" "}
            everyone else&apos;s.
          </h1>

          <p
            {...rise(2)}
            className="hero-rise mt-5 max-w-[48ch] text-base leading-relaxed text-muted sm:text-lg"
          >
            Paste a URL. We crawl your pages, scan every modern CSS feature, and
            score what really renders across browsers.
          </p>

          <div {...rise(3)} className="hero-rise mt-8">
            <UrlForm size="lg" />
          </div>
        </div>

        <div {...rise(4)} className="hero-rise">
          <ReportPreview />
        </div>
      </div>
    </section>
  );
}
