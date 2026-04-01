import { createApp } from "./app";
import { RedisCounterRepository } from "./repositories/redisCounterRepository";
import { createRateLimiterRedisClient } from "./redis/createRateLimiterRedisClient";
import { RateLimiterService } from "./services/rateLimiterService";

async function startServer(): Promise<void> {
  const redisClient = createRateLimiterRedisClient();

  await redisClient.connect();

  const app = createApp(
    new RateLimiterService(new RedisCounterRepository(redisClient))
  );
  const port = Number(process.env.PORT ?? 3000);

  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  let isShuttingDown = false;

  const shutdown = (signal: NodeJS.Signals): void => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    console.log(`Received ${signal}, shutting down`);

    server.close(async (serverError) => {
      let exitCode = serverError === undefined ? 0 : 1;

      if (serverError !== undefined) {
        console.error("Failed to close HTTP server cleanly", serverError);
      }

      try {
        if (redisClient.isOpen) {
          await redisClient.quit();
        }
      } catch (redisError) {
        exitCode = 1;
        console.error("Failed to close Redis connection cleanly", redisError);
      }

      process.exit(exitCode);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

void startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
