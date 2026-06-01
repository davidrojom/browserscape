import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import css from "../styles.css?url";

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
    links: [{ rel: "stylesheet", href: css }],
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
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
