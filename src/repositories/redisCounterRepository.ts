import { createClient } from "redis";
import {
  CounterRepository,
  FixedWindowCheckInput,
  FixedWindowCheckResult
} from "../domain/rateLimit";

type RateLimiterRedisClient = ReturnType<typeof createClient>;

const CHECK_FIXED_WINDOW_SCRIPT = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local windowMs = tonumber(ARGV[2])
local nowMs = tonumber(ARGV[3])

local count = redis.call('HGET', key, 'count')
local windowStartMs = redis.call('HGET', key, 'windowStartMs')

if not count or not windowStartMs then
  redis.call('HSET', key, 'count', 1, 'windowStartMs', nowMs)
  redis.call('PEXPIRE', key, windowMs)
  return {1, 1, nowMs}
end

count = tonumber(count)
windowStartMs = tonumber(windowStartMs)

if nowMs >= windowStartMs + windowMs then
  redis.call('HSET', key, 'count', 1, 'windowStartMs', nowMs)
  redis.call('PEXPIRE', key, windowMs)
  return {1, 1, nowMs}
end

if count < limit then
  local newCount = redis.call('HINCRBY', key, 'count', 1)
  return {1, newCount, windowStartMs}
end

return {0, count, windowStartMs}
`;

export class RedisCounterRepository implements CounterRepository {
  constructor(private readonly client: RateLimiterRedisClient) {}

  async checkFixedWindow(
    input: FixedWindowCheckInput
  ): Promise<FixedWindowCheckResult> {
    const reply = await this.client.eval(CHECK_FIXED_WINDOW_SCRIPT, {
      keys: [input.bucketKey],
      arguments: [
        input.limit.toString(),
        input.windowMs.toString(),
        input.nowMs.toString()
      ]
    });

    return parseFixedWindowReply(reply);
  }
}

function parseFixedWindowReply(reply: unknown): FixedWindowCheckResult {
  if (!Array.isArray(reply) || reply.length !== 3) {
    throw new Error("Unexpected Redis script response");
  }

  const allowedFlag = toNumber(reply[0], "allowed");
  const count = toNumber(reply[1], "count");
  const windowStartMs = toNumber(reply[2], "windowStartMs");

  if (allowedFlag !== 0 && allowedFlag !== 1) {
    throw new Error("Unexpected Redis script allowed flag");
  }

  return {
    allowed: allowedFlag === 1,
    count,
    windowStartMs
  };
}

function toNumber(value: unknown, fieldName: string): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsedValue = Number(value);

    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  throw new Error(`Unexpected Redis script ${fieldName} value`);
}
