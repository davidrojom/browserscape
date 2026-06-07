import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
// Inline the (small, ~8.5 KB gzip) app CSS into the SSR document head as a
// <style> tag instead of a hashed <link>. TanStack Start runs the client and
// SSR builds separately, and each emits its own styles-[hash].css; when the two
// content hashes diverge the SSR <link> points at a file that only exists under
// the client hash, 404s, and the page paints unstyled until hydration reinjects
// the correct link (FOUC). Inlining removes that dependency entirely and is the
// recommended delivery for critical CSS this size.
import css from "../styles.css?inline";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Browserscape - CSS browser compatibility analysis" },
      {
        name: "description",
        content:
          "Paste a URL and Browserscape crawls the pages, scans every CSS feature, and scores real-world browser support.",
      },
      { name: "theme-color", content: "#0a0b0d" },
    ],
    scripts: [
      {
        src: "https://analytics.davidrojom.com/script.js",
        defer: true,
        "data-website-id": "f82373d9-88be-42e7-b508-2d6543cc4b79",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent(): ReactNode {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
