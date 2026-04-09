import { RateLimitRequest, RateLimitResponse } from "../domain/rateLimit";

export type RateLimiterPort = {
  checkRateLimit(request: RateLimitRequest): Promise<RateLimitResponse>;
};
