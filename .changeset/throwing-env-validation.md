---
"@acdh-oeaw/validate-env": minor
---

**breaking:** `createEnv` no longer uses `Result` types. schema functions now return the validated
values directly and should throw a `ValidationError` on failure; `createEnv` returns the validated
environment and throws when validation fails. the `@acdh-oeaw/lib` dependency has been removed.
