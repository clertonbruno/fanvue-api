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

export type FixedWindowCheckInput = {
  bucketKey: string;
  limit: number;
  windowMs: number;
  nowMs: number;
};

export type FixedWindowCheckResult = Counter & {
  allowed: boolean;
};

export type CounterRepository = {
  checkFixedWindow(input: FixedWindowCheckInput): Promise<FixedWindowCheckResult>;
};
