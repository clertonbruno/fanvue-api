import { FixedWindowCheckInput, FixedWindowCheckResult } from "../domain/rateLimit";

export type CounterRepositoryPort = {
  checkFixedWindow(input: FixedWindowCheckInput): Promise<FixedWindowCheckResult>;
};
