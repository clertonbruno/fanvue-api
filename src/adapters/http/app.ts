import express, { Express, NextFunction, Request, Response } from "express";
import { RateLimiterPort } from "../../ports/rateLimiterPort";
import { createRateLimitRouter } from "./rateLimitRoutes";

export function createApp(rateLimiterService: RateLimiterPort): Express {
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

      console.error("Unhandled application error", error);

      return response.status(500).json({
        error: "Internal server error"
      });
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
