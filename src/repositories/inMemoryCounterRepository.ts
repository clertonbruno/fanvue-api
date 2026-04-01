import { Counter } from "../domain/rateLimit";

export class InMemoryCounterRepository {
  private readonly counters = new Map<string, Counter>();

  get(bucketKey: string): Counter | undefined {
    return this.counters.get(bucketKey);
  }

  set(bucketKey: string, counter: Counter): void {
    this.counters.set(bucketKey, counter);
  }
}
