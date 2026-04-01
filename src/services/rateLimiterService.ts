import {
  Counter,
  RateLimitRequest,
  RateLimitResponse
} from "../domain/rateLimit";
import { InMemoryCounterRepository } from "../repositories/inMemoryCounterRepository";

type Clock = () => number;

export class RateLimiterService {
  constructor(
    private readonly counterRepository: InMemoryCounterRepository,
    private readonly now: Clock = () => Date.now()
  ) {}

  checkRateLimit(request: RateLimitRequest): RateLimitResponse {
    const bucketKey = `${request.key}:${request.limit}:${request.windowSec}`;
    const windowMs = request.windowSec * 1000;
    const nowMs = this.now();
    const existingCounter = this.counterRepository.get(bucketKey);

    if (existingCounter === undefined) {
      const counter: Counter = {
        count: 1,
        windowStartMs: nowMs
      };

      this.counterRepository.set(bucketKey, counter);

      return this.buildResponse(true, request.limit - 1, nowMs + windowMs, nowMs);
    }

    const windowEndMs = existingCounter.windowStartMs + windowMs;

    if (nowMs >= windowEndMs) {
      const counter: Counter = {
        count: 1,
        windowStartMs: nowMs
      };

      this.counterRepository.set(bucketKey, counter);

      return this.buildResponse(true, request.limit - 1, nowMs + windowMs, nowMs);
    }

    if (existingCounter.count < request.limit) {
      const counter: Counter = {
        count: existingCounter.count + 1,
        windowStartMs: existingCounter.windowStartMs
      };

      this.counterRepository.set(bucketKey, counter);

      return this.buildResponse(
        true,
        request.limit - counter.count,
        windowEndMs,
        nowMs
      );
    }

    return this.buildResponse(
      false,
      request.limit - existingCounter.count,
      windowEndMs,
      nowMs
    );
  }

  private buildResponse(
    allowed: boolean,
    remaining: number,
    windowEndMs: number,
    nowMs: number
  ): RateLimitResponse {
    const retryAfterMs = Math.max(windowEndMs - nowMs, 0);

    return {
      allowed,
      remaining: Math.max(remaining, 0),
      retryAfterSec: Math.ceil(retryAfterMs / 1000),
      resetAt: new Date(windowEndMs).toISOString()
    };
  }
}
