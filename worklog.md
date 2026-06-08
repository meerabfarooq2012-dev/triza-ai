---
Task ID: 1
Agent: Main
Task: Fix systemic "Authentication Required" errors and "ew is not a function" error, push to Vercel

Work Log:
- Investigated the authentication system architecture across proxy.ts, auth-middleware.ts, api.ts, login route, admin routes
- Identified root cause: `proxy.ts` line 17 reads `JWT_SECRET` at module level. On Vercel Edge Runtime, if JWT_SECRET is not configured for Edge, it's empty string, causing `verifyJwt()` to always return null (line 77), blocking ALL admin API requests with 401 before they reach the route handler
- Fixed proxy.ts: When JWT_SECRET is not available on Edge, return a deferred sentinel instead of null, so the request passes through to the Node.js route handler which has full access to env vars
- Fixed "ew is not a function" error: Added version 2 to Zustand persist config with migrate function that clears corrupted localStorage data from old versions where action functions were serialized as null
- Reset admin password in local SQLite database
- Verified login works locally (200 OK with JWT token)
- Verified admin settings API works with auth token (returns settings data)
- Pushed fixes to GitHub (commit 7e71593) which should trigger Vercel deployment

Stage Summary:
- proxy.ts now defers auth to route handler when JWT_SECRET is unavailable on Edge Runtime
- Zustand store version bumped to 2 with migration to clear corrupted localStorage
- All changes pushed to origin/main for Vercel deployment
- Landing page verified working via agent-browser (no errors, full UI renders)
- Console warnings (Zustand hydration timing, getSnapshot caching) are non-blocking
