import { Router } from "express";
import { rateLimitRequestSchema } from "../schemas/rateLimitSchemas";
import { RateLimiterService } from "../services/rateLimiterService";

export function createRateLimitRouter(
  rateLimiterService: RateLimiterService
): Router {
  const router = Router();

  router.post("/check", (request, response) => {
    const parsedBody = rateLimitRequestSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return response.status(400).json({
        error: "Invalid request body",
        details: parsedBody.error.flatten()
      });
    }

    const result = rateLimiterService.checkRateLimit(parsedBody.data);

    return response.json(result);
  });

  return router;
}
