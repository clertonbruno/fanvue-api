import { z } from "zod";

const limitSchema = z
  .int()
  .positive("limit must be positive")
  .max(1000, "limit must be 1000 or less");

const windowSecSchema = z
  .int()
  .positive("windowSec must be positive")
  .max(86_400, "windowSec must be 86400 or less");

export const rateLimitDefaults = {
  limit: getEnvNumber("RATE_LIMIT_DEFAULT_LIMIT", 5, limitSchema),
  windowSec: getEnvNumber(
    "RATE_LIMIT_DEFAULT_WINDOW_SEC",
    60,
    windowSecSchema
  )
};

export const rateLimitRequestSchema = z.object({
  key: z
    .string()
    .refine((value) => value.trim().length > 0, "key is required"),
  limit: limitSchema.optional().default(rateLimitDefaults.limit),
  windowSec: windowSecSchema.optional().default(rateLimitDefaults.windowSec)
});

function getEnvNumber(
  name: string,
  fallbackValue: number,
  schema: z.ZodNumber
): number {
  const rawValue = process.env[name];

  if (rawValue === undefined) {
    return fallbackValue;
  }

  const parsedValue = Number(rawValue);

  return schema.parse(parsedValue);
}
