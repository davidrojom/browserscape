import type { AnalyzeResponse } from "./types.js";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface AnalyzeRequestOptions {
  browserslist?: string;
  maxDepth?: number;
  maxPages?: number;
}

export interface ApiConfig {
  apiBase: string;
}

export async function analyze(
  url: string,
  config: ApiConfig,
  opts: AnalyzeRequestOptions,
): Promise<AnalyzeResponse> {
  const res = await fetch(`${config.apiBase}/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url, ...opts }),
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as { message?: string | string[] };
      if (data.message)
        message = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message;
    } catch {
      // ignore parse error
    }
    throw new ApiError(message, res.status);
  }
  return (await res.json()) as AnalyzeResponse;
}

export const DEFAULT_API_BASE =
  (import.meta.env?.VITE_API_BASE as string | undefined) ??
  "http://localhost:3001";
