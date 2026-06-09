# Task 6 — Security Fix: next.config.ts Wildcard Image Domain + reactStrictMode

## Agent: security

## Summary
Fixed two security vulnerabilities in `next.config.ts` and documented an SSRF risk in `Caddyfile`:

1. **Wildcard image domain removed**: Replaced `hostname: '**'` (allowed images from ANY hostname) with specific allowed domains:
   - `veplxumszgotnkassotw.supabase.co` (explicit current project)
   - `*.supabase.co` (covers all Supabase projects without wildcards)
   - `localhost` (http + https for local development)

2. **reactStrictMode enabled**: Changed from `false` to `true`

3. **Caddyfile SSRF warning**: Added detailed security warning comment about the XTransformPort SSRF risk (functionality unchanged)

4. **ignoreBuildErrors kept**: Left as `true` per instructions (lower priority)

## Files Modified
- `/home/z/my-project/next.config.ts` — Image domain restrictions + reactStrictMode
- `/home/z/my-project/Caddyfile` — SSRF warning comment only
- `/home/z/my-project/worklog.md` — Appended task log

## Verification
- Lint: 0 errors, 3 pre-existing warnings (unrelated)
- Dev server restarted successfully after config change
