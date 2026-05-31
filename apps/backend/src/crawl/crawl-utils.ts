export function normalizeUrl(href: string, base?: string): string {
  const u = new URL(href, base);
  u.hash = "";
  let s = u.toString();
  if (s.endsWith("/") && u.pathname !== "/") s = s.slice(0, -1);
  if (u.pathname === "/") s = `${u.protocol}//${u.host}`;
  return s;
}

export function isSameOrigin(a: string, b: string): boolean {
  try {
    return new URL(a).origin === new URL(b).origin;
  } catch {
    return false;
  }
}

export function extractLinks(hrefs: string[], base: string): string[] {
  const out = new Set<string>();
  for (const href of hrefs) {
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("javascript:")
    )
      continue;
    try {
      const abs = normalizeUrl(href, base);
      if (isSameOrigin(abs, base)) out.add(abs);
    } catch {
      // ignore malformed
    }
  }
  return [...out];
}
