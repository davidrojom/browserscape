import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "../components/SiteHeader.js";
import { SiteFooter } from "../components/SiteFooter.js";
import { Hero } from "../components/landing/Hero.js";
import { FeatureTicker } from "../components/landing/FeatureTicker.js";
import { Pipeline } from "../components/landing/Pipeline.js";
import { SupportMatrix } from "../components/landing/SupportMatrix.js";
import { CtaBand } from "../components/landing/CtaBand.js";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <div className="min-h-[100dvh]">
      <SiteHeader />
      <main>
        <Hero />
        <FeatureTicker />
        <Pipeline />
        <SupportMatrix />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}
