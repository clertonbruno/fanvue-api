import { Router } from "express";
import { RateLimiterPort } from "../../ports/rateLimiterPort";
import { rateLimitRequestSchema } from "../../schemas/rateLimitSchemas";

export function createRateLimitRouter(
  rateLimiterService: RateLimiterPort
): Router {
  const router = Router();

  router.post("/check", async (request, response, next) => {
    const parsedBody = rateLimitRequestSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return response.status(400).json({
        error: "Invalid request body",
        details: parsedBody.error.flatten()
      });
    }

    try {
      const result = await rateLimiterService.checkRateLimit(parsedBody.data);

      return response.json(result);
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
