import {
  CounterRepository,
  RateLimitRequest,
  RateLimitResponse
} from "../domain/rateLimit";

type Clock = () => number;

export class RateLimiterService {
  constructor(
    private readonly counterRepository: CounterRepository,
    private readonly now: Clock = () => Date.now()
  ) {}

  async checkRateLimit(request: RateLimitRequest): Promise<RateLimitResponse> {
    const bucketKey = `${request.key}:${request.limit}:${request.windowSec}`;
    const windowMs = request.windowSec * 1000;
    const nowMs = this.now();
    const result = await this.counterRepository.checkFixedWindow({
      bucketKey,
      limit: request.limit,
      windowMs,
      nowMs
    });
    const windowEndMs = result.windowStartMs + windowMs;

    return this.buildResponse(
      result.allowed,
      request.limit - result.count,
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
