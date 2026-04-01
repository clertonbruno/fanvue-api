# Fixed-Window Rate Limiter API

Small TypeScript + Express API with a single `POST /check` endpoint that evaluates a fixed-window rate limit in memory.

## What It Does

- Validates the request body with Zod.
- Builds a bucket key from `key`, `limit`, and `windowSec`.
- Tracks counters in a process-local `Map`.
- Returns whether the request is allowed, how many requests remain, and when the window resets.

## Run It

```bash
npm install
npm run dev
```

The server starts on `http://localhost:3000`.

Run tests with:

```bash
npm test
```

## Example Request

```bash
curl -X POST http://localhost:3000/check \
  -H "Content-Type: application/json" \
  -d '{
    "key": "user:123",
    "limit": 5,
    "windowSec": 60
  }'
```

Example response:

```json
{
  "allowed": true,
  "remaining": 4,
  "retryAfterSec": 60,
  "resetAt": "2026-04-01T18:21:00.000Z"
}
```

## Design Choices

- Fixed-window implementation only, because that is the requested algorithm.
- In-memory `Map` repository, because persistence and distribution are explicitly out of scope.
- Small clock injection in the service, so tests stay deterministic without adding much abstraction.
- Input bounds of `limit <= 1000` and `windowSec <= 86400` to reject obviously unreasonable payloads in a small interview exercise.

## Trade-Offs

- State is lost on process restart.
- Limits are enforced per process, not across multiple instances.
- Fixed-window limiting is simple but can allow bursts at window boundaries.
- The in-memory map grows with unique bucket keys and has no eviction policy.

## Production Evolution

- Move counters to shared storage such as Redis for multi-instance enforcement.
- Add TTL or cleanup for idle buckets.
- Add metrics, structured logging, and request identifiers.
- Consider a sliding-window or token-bucket algorithm if smoother limiting is needed.
