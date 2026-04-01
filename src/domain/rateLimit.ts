export type RateLimitRequest = {
  key: string;
  limit: number;
  windowSec: number;
};

export type RateLimitResponse = {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
  resetAt: string;
};

export type Counter = {
  count: number;
  windowStartMs: number;
};
