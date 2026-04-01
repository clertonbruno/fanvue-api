import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { RateLimitRequest } from "../src/domain/rateLimit";
import { InMemoryCounterRepository } from "../src/repositories/inMemoryCounterRepository";
import { RateLimiterService } from "../src/services/rateLimiterService";

const baseRequest: RateLimitRequest = {
  key: "user:123",
  limit: 5,
  windowSec: 60
};

describe("RateLimiterService", () => {
  it("allows the first request", async () => {
    const nowMs = Date.parse("2026-04-01T18:20:00.000Z");
    const service = new RateLimiterService(
      new InMemoryCounterRepository(),
      () => nowMs
    );

    const result = await service.checkRateLimit(baseRequest);

    expect(result).toEqual({
      allowed: true,
      remaining: 4,
      retryAfterSec: 60,
      resetAt: "2026-04-01T18:21:00.000Z"
    });
  });

  it("allows requests until the limit is reached", async () => {
    const nowMs = Date.parse("2026-04-01T18:20:00.000Z");
    const service = new RateLimiterService(
      new InMemoryCounterRepository(),
      () => nowMs
    );

    for (let attempt = 1; attempt < baseRequest.limit; attempt += 1) {
      await service.checkRateLimit(baseRequest);
    }

    const result = await service.checkRateLimit(baseRequest);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterSec).toBe(60);
  });

  it("blocks once the limit is exceeded", async () => {
    const nowMs = Date.parse("2026-04-01T18:20:00.000Z");
    const service = new RateLimiterService(
      new InMemoryCounterRepository(),
      () => nowMs
    );

    for (let attempt = 0; attempt < baseRequest.limit; attempt += 1) {
      await service.checkRateLimit(baseRequest);
    }

    const result = await service.checkRateLimit(baseRequest);

    expect(result).toEqual({
      allowed: false,
      remaining: 0,
      retryAfterSec: 60,
      resetAt: "2026-04-01T18:21:00.000Z"
    });
  });

  it("resets after the window expires", async () => {
    let nowMs = Date.parse("2026-04-01T18:20:00.000Z");
    const service = new RateLimiterService(
      new InMemoryCounterRepository(),
      () => nowMs
    );

    for (let attempt = 0; attempt < baseRequest.limit; attempt += 1) {
      await service.checkRateLimit(baseRequest);
    }

    nowMs += 60_000;

    const result = await service.checkRateLimit(baseRequest);

    expect(result).toEqual({
      allowed: true,
      remaining: 4,
      retryAfterSec: 60,
      resetAt: "2026-04-01T18:22:00.000Z"
    });
  });
});

describe("POST /check", () => {
  it("returns the rate limit result", async () => {
    const nowMs = Date.parse("2026-04-01T18:20:00.000Z");
    const app = createApp(
      new RateLimiterService(new InMemoryCounterRepository(), () => nowMs)
    );

    const response = await request(app).post("/check").send(baseRequest);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      allowed: true,
      remaining: 4,
      retryAfterSec: 60,
      resetAt: "2026-04-01T18:21:00.000Z"
    });
  });

  it("returns 400 for invalid input", async () => {
    const app = createApp(
      new RateLimiterService(new InMemoryCounterRepository())
    );

    const response = await request(app).post("/check").send({
      key: "",
      limit: 0,
      windowSec: -1
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid request body");
  });
});
