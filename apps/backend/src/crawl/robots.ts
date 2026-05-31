import robotsParser from "robots-parser";

export const USER_AGENT = "BrowserscapeBot";

export type RobotsChecker = (url: string) => boolean;

export async function createRobotsChecker(
  baseUrl: string,
  fetchBody: (robotsUrl: string) => Promise<string | null>,
): Promise<RobotsChecker> {
  const robotsUrl = new URL("/robots.txt", baseUrl).toString();
  let body: string | null = null;
  try {
    body = await fetchBody(robotsUrl);
  } catch {
    body = null;
  }
  if (!body) return () => true;
  const robots = robotsParser(robotsUrl, body);
  return (url: string) => robots.isAllowed(url, USER_AGENT) ?? true;
}
