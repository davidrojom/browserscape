import { Link } from "@tanstack/react-router";
import { GithubLogo } from "@phosphor-icons/react";
import { Wordmark } from "./ui/Wordmark.js";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="transition-opacity hover:opacity-80">
          <Wordmark />
        </Link>

        <nav className="flex items-center gap-7 text-sm text-muted">
          <a href="/#how" className="hidden transition-colors hover:text-fg sm:block">
            How it works
          </a>
          <a
            href="/#features"
            className="hidden transition-colors hover:text-fg sm:block"
          >
            What it catches
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            className="transition-colors hover:text-fg"
          >
            <GithubLogo size={20} />
          </a>
        </nav>
      </div>
    </header>
  );
}
