import type { BrowserRef } from "./types.js";

const NAMES: Record<string, string> = {
  ie: "IE",
  edge: "Edge",
  firefox: "Firefox",
  chrome: "Chrome",
  safari: "Safari",
  opera: "Opera",
  ios_saf: "Safari iOS",
  op_mini: "Opera Mini",
  android: "Android Browser",
  and_chr: "Chrome Android",
  and_ff: "Firefox Android",
  samsung: "Samsung Internet",
  and_qq: "QQ Browser",
  and_uc: "UC Browser",
  baidu: "Baidu",
  kaios: "KaiOS",
};

export function browserName(id: string): string {
  return NAMES[id] ?? id;
}

export function missingDataToRefs(
  missingData: Record<string, Record<string, string>>,
): BrowserRef[] {
  const refs: BrowserRef[] = [];
  for (const [id, versions] of Object.entries(missingData ?? {})) {
    for (const version of Object.keys(versions)) {
      refs.push({ id, name: browserName(id), version });
    }
  }
  return refs;
}

export function refsToBrowserslistTokens(refs: BrowserRef[]): string[] {
  return refs.map((r) => `${r.id} ${r.version}`);
}
