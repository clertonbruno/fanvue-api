# Fixed-Window Rate Limiter API

Small TypeScript + Express API with a single `POST /check` endpoint that evaluates a fixed-window rate limit and stores counters in Redis.

## What It Does

- Validates the request body with Zod.
- Builds a bucket key from `key`, `limit`, and `windowSec`.
- Tracks counters in Redis so limits are shared outside a single process.
- Returns whether the request is allowed, how many requests remain, and when the window resets.

## Run It

```bash
npm install
npm run dev
```

The server starts on `http://localhost:3000`.

Set `REDIS_URL` if Redis is not running on `redis://localhost:6379`.

Run tests with:

```bash
npm test
```

## Build The Image

```bash
docker build -t fixed-window-rate-limiter-api .
```

## Run With Docker Compose

```bash
docker compose up --build
```

This starts:

- the API on `http://localhost:3000`
- a single Redis node with AOF enabled for persistence

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
- Redis repository, so rate-limit state is shared outside the Node process.
- Redis updates are done with a Lua script so the read/update decision is atomic.
- Small clock injection in the service, so tests stay deterministic without adding much abstraction.
- Input bounds of `limit <= 1000` and `windowSec <= 86400` to reject obviously unreasonable payloads in a small interview exercise.

## Trade-Offs

- This uses a single Redis node, so it is still a single point of failure.
- Fixed-window limiting is simple but can allow bursts at window boundaries.
- Redis key expiry is tied to the window length, so idle buckets are cleaned up automatically.

## Production Evolution

- Move to managed Redis or a replicated Redis deployment for higher availability.
- Add metrics, structured logging, and request identifiers.
- Consider a sliding-window or token-bucket algorithm if smoother limiting is needed.
