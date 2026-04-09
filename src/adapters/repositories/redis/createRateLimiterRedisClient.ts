import { createClient } from "redis";

type RateLimiterRedisClient = ReturnType<typeof createClient>;

export function createRateLimiterRedisClient(
  redisUrl: string = process.env.REDIS_URL ?? "redis://localhost:6379"
): RateLimiterRedisClient {
  const client = createClient({
    url: redisUrl
  });

  client.on("error", (error) => {
    console.error("Redis client error", error);
  });

  return client;
}
