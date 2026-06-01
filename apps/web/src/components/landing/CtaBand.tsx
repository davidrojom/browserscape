import { Reveal } from "../ui/Reveal.js";
import { UrlForm } from "../ui/UrlForm.js";

export function CtaBand() {
  return (
    <section className="px-5 py-16 sm:py-24">
      <Reveal>
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[20px] border border-line bg-surface px-6 py-12 sm:px-12 sm:py-16">
          <div className="grid-scape pointer-events-none absolute inset-0 opacity-60" />
          <div className="glow-accent pointer-events-none absolute inset-0" />
          <div className="relative flex flex-col items-center text-center">
            <h2 className="max-w-[18ch] text-3xl font-semibold tracking-tight sm:text-4xl">
              See your site the way every browser does.
            </h2>
            <p className="mt-4 max-w-[42ch] text-muted">
              One URL. The full compatibility report in seconds.
            </p>
            <div className="mt-8 flex w-full justify-center">
              <UrlForm size="lg" showExamples={false} />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
