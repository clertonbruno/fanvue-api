# AGENTS.md

## Goal
Help solve production-style engineering problems live in a pragmatic, incremental, interview-appropriate way.

Optimize for:
- correctness first
- fast orientation
- minimal, safe changes
- clear reasoning
- maintainable code
- compatibility with existing codebase patterns

## Working style
- Treat the task like a real engineering problem in an existing team codebase.
- Prefer small, reversible steps over broad rewrites.
- Start with the smallest correct implementation, then harden it.
- Reuse existing utilities, helpers, patterns, and conventions whenever possible.
- Do not introduce new abstractions unless they clearly simplify the solution.
- Avoid unnecessary refactors unrelated to the task.
- Always be concise, not verbose, as I'll have limited time to review your explanations.

## Before writing code
First, quickly determine:
1. likely entry points
2. relevant files/modules
3. request/data flow
4. existing patterns that should be followed
5. constraints or assumptions that could affect the solution

When helpful, summarize this briefly before coding.

## Implementation priorities
Prioritize in this order:
1. understand requirements and constraints
2. identify the relevant data model / contracts
3. implement core happy path
4. validate with tests/typecheck/runtime checks
5. add edge cases and error handling
6. discuss trade-offs and possible next steps

If fixing a bug:
- find root cause first
- avoid masking symptoms
- avoid broad changes until the cause is understood

If adding a feature:
- implement the simplest version that fits the codebase
- preserve backwards compatibility unless explicitly told otherwise

## Code quality rules
- Prefer clear, boring, readable code over clever code.
- Avoid duplicated logic when an existing utility or shared function already solves it.
- Avoid unsafe shortcuts such as:
  - `any`
  - unnecessary type assertions / casts
  - non-null assertions unless clearly justified
  - swallowing exceptions
  - deleting or weakening tests to make things pass
  - hardcoding values just to satisfy a failing scenario
- Do not silently change behavior outside the requested scope.
- Be careful with side effects, async behavior, and shared mutable state.

## Data / backend considerations
When relevant, explicitly watch for:
- N+1 query patterns
- read-then-write race conditions
- missing transactional boundaries
- idempotency concerns
- hidden side effects
- backwards compatibility risks
- performance regressions from repeated work or unnecessary loops

## Testing / validation
Validate often and early.
After each meaningful change, prefer some combination of:
- targeted test run
- typecheck
- lint
- quick manual execution / debug
- logging / inspection to confirm behavior

Good tests should cover, when relevant:
- happy path
- empty / missing input
- single-item case
- boundaries
- duplicates
- invalid input
- regression case
- larger input / performance-sensitive path

## AI usage rules
Use AI as a strong assistant, not an autopilot.

Good uses:
- summarize architecture or code flow
- identify entry points and relevant files
- suggest edge cases and tests
- review a proposed diff for regressions, smell, or inconsistency
- explain existing code patterns
- add concise temporary comments to only the main files/classes/methods relevant to the task

Bad uses:
- broad repo rewrites
- speculative changes without grounding in the codebase
- introducing layers of abstraction by default
- generating large diffs without explanation
- solving by bypassing type safety or tests

Always review generated code critically for:
- verbosity
- unnecessary abstraction
- incorrect assumptions
- hidden behavior changes
- fake fixes

## Communication style
Be concise and high-signal.
When helping, structure reasoning as:
1. what is likely happening
2. smallest sensible next step
3. validation plan
4. trade-offs or risks

Do not over-explain obvious code.
Do not produce long essays unless asked.

## If stuck
If uncertainty is high:
- surface assumptions explicitly
- reduce scope
- propose the smallest safe path forward
- identify what should be verified next