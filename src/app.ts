import express, { Express, NextFunction, Request, Response } from "express";
import { InMemoryCounterRepository } from "./repositories/inMemoryCounterRepository";
import { createRateLimitRouter } from "./routes/rateLimitRoutes";
import { RateLimiterService } from "./services/rateLimiterService";

export function createApp(
  rateLimiterService: RateLimiterService = new RateLimiterService(
    new InMemoryCounterRepository()
  )
): Express {
  const app = express();

  app.use(express.json());
  app.use(createRateLimitRouter(rateLimiterService));

  app.use(
    (
      error: unknown,
      _request: Request,
      response: Response,
      next: NextFunction
    ) => {
      if (isBodyParseError(error)) {
        return response.status(400).json({
          error: "Invalid JSON body"
        });
      }

      return next(error);
    }
  );

  return app;
}

function isBodyParseError(
  error: unknown
): error is SyntaxError & { status: number } {
  return (
    error instanceof SyntaxError &&
    "status" in error &&
    typeof error.status === "number" &&
    error.status === 400
  );
}
