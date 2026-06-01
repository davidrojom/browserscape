import { motion, useReducedMotion } from "motion/react";
import { Link as LinkIcon, Crosshair, ChartBar } from "@phosphor-icons/react";
import { Reveal } from "../ui/Reveal.js";

const STEPS = [
  {
    n: "1",
    icon: LinkIcon,
    title: "Paste a URL",
    body: "Any public address. No account, no install, no config files.",
  },
  {
    n: "2",
    icon: Crosshair,
    title: "We crawl and scan",
    body: "Linked pages get crawled and every stylesheet parsed for modern CSS.",
  },
  {
    n: "3",
    icon: ChartBar,
    title: "Read the report",
    body: "A support score, ranked issues, and the exact pages they live on.",
  },
];

export function Pipeline() {
  const reduce = useReducedMotion();
  return (
    <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24">
      <Reveal>
        <h2 className="max-w-[16ch] text-3xl font-semibold tracking-tight sm:text-4xl">
          From URL to report in a single pass.
        </h2>
      </Reveal>

      <div className="relative mt-16">
        {/* drawn connector (desktop) */}
        <motion.div
          aria-hidden="true"
          className="absolute left-0 right-0 top-6 hidden h-px origin-left bg-line lg:block"
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
        />
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12}>
              <div className="relative">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line bg-bg text-accent">
                    <s.icon size={20} weight="bold" />
                  </span>
                  <span className="font-mono text-sm text-faint">0{s.n}</span>
                </div>
                <h3 className="mt-5 text-xl font-medium">{s.title}</h3>
                <p className="mt-2 max-w-[34ch] leading-relaxed text-muted">
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
