import { z } from "zod";

export const rateLimitRequestSchema = z.object({
  key: z
    .string()
    .refine((value) => value.trim().length > 0, "key is required"),
  limit: z
    .int()
    .positive("limit must be positive")
    .max(1000, "limit must be 1000 or less"),
  windowSec: z
    .int()
    .positive("windowSec must be positive")
    .max(86_400, "windowSec must be 86400 or less")
});
