import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Test } from "@nestjs/testing";
import { ValidationPipe, type INestApplication } from "@nestjs/common";
import { createServer, type Server } from "node:http";
import request from "supertest";
import { AnalyzeModule } from "./analyze.module.js";

let app: INestApplication;
let target: Server;
let targetUrl: string;

beforeAll(async () => {
  target = createServer((req, res) => {
    if (req.url === "/nocss") {
      // Loads with 200 but carries no stylesheet — the shape of a bot-protection
      // challenge page. There is nothing real to score here.
      res.setHeader("content-type", "text/html");
      res.end(`<html><head><title>t</title></head><body>blocked</body></html>`);
      return;
    }
    res.setHeader("content-type", "text/html");
    res.end(
      `<html><head><style>.h{display:flow-root}</style></head><body>home</body></html>`,
    );
  });
  await new Promise<void>((r) => target.listen(0, r));
  targetUrl = `http://127.0.0.1:${(target.address() as { port: number }).port}/`;

  const moduleRef = await Test.createTestingModule({
    imports: [AnalyzeModule],
  }).compile();
  app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
}, 60000);

afterAll(async () => {
  await app?.close();
  await new Promise<void>((r) => target.close(() => r()));
});

describe("POST /analyze", () => {
  it("returns a report for a crawled URL", async () => {
    const res = await request(app.getHttpServer())
      .post("/analyze")
      .send({
        url: targetUrl,
        browserslist: "ie 11, chrome 120",
        maxDepth: 0,
        maxPages: 1,
      })
      .expect(201);
    expect(res.body.pagesAnalyzed).toBe(1);
    expect(res.body.report.overallScore).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(res.body.report.features)).toBe(true);
  }, 90000);

  it("rejects an invalid url with 400", async () => {
    await request(app.getHttpServer())
      .post("/analyze")
      .send({ url: "not-a-url" })
      .expect(400);
  });

  it("returns 503 instead of a hollow 100% when no CSS could be extracted", async () => {
    await request(app.getHttpServer())
      .post("/analyze")
      .send({ url: `${targetUrl}nocss`, maxDepth: 0, maxPages: 1 })
      .expect(503);
  }, 90000);
});
