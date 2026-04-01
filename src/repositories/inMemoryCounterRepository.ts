import {
  Counter,
  CounterRepository,
  FixedWindowCheckInput,
  FixedWindowCheckResult
} from "../domain/rateLimit";

export class InMemoryCounterRepository implements CounterRepository {
  private readonly counters = new Map<string, Counter>();

  async checkFixedWindow(
    input: FixedWindowCheckInput
  ): Promise<FixedWindowCheckResult> {
    const existingCounter = this.counters.get(input.bucketKey);

    if (existingCounter === undefined) {
      const counter: Counter = {
        count: 1,
        windowStartMs: input.nowMs
      };

      this.counters.set(input.bucketKey, counter);

      return {
        allowed: true,
        count: counter.count,
        windowStartMs: counter.windowStartMs
      };
    }

    const windowEndMs = existingCounter.windowStartMs + input.windowMs;

    if (input.nowMs >= windowEndMs) {
      const counter: Counter = {
        count: 1,
        windowStartMs: input.nowMs
      };

      this.counters.set(input.bucketKey, counter);

      return {
        allowed: true,
        count: counter.count,
        windowStartMs: counter.windowStartMs
      };
    }

    if (existingCounter.count < input.limit) {
      const counter: Counter = {
        count: existingCounter.count + 1,
        windowStartMs: existingCounter.windowStartMs
      };

      this.counters.set(input.bucketKey, counter);

      return {
        allowed: true,
        count: counter.count,
        windowStartMs: counter.windowStartMs
      };
    }

    return {
      allowed: false,
      count: existingCounter.count,
      windowStartMs: existingCounter.windowStartMs
    };
  }
}
