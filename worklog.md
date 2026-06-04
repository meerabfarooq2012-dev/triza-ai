---
Task ID: 1
Agent: Main
Task: Fix ChunkLoadError, sign-in problem, and Our Motive visibility on Vercel

Work Log:
- Investigated ChunkLoadError: "Failed to load chunk /_next/static/chunks/2ace0a670a85c69c.js from module 42942"
- Root cause: Stale chunk hashes after new deployment - browser cached old chunks
- Added early ChunkLoadError recovery script in layout.tsx that runs before React hydrates
- Improved page.tsx ChunkLoadError handlers with cache-busting reloads (using _r=timestamp)
- Created withChunkRetry wrapper for all dynamic imports to catch chunk loading failures
- Improved ErrorBoundary with user-friendly "App Update Available" UI for chunk errors
- Fixed sign-in issue: ChunkLoadError was preventing AuthModal from loading (same root cause)
- Verified login API works correctly (returns proper error for invalid credentials)
- Fixed "Our Motive" section visibility: removed redundant Tailwind bg-clip-text/text-transparent classes that conflicted with custom gold-gradient-text and gold-shimmer-text CSS
- Added color: transparent to custom CSS classes for better cross-browser support
- Deployed to Vercel via GitHub push

Stage Summary:
- ChunkLoadError now auto-recovered with 3 layers: early script, dynamic import wrapper, error boundary
- Sign-in works when chunks load properly (API confirmed working)
- "Our Motive" section gold text effects now use clean CSS without conflicting Tailwind classes
- All changes committed and pushed to GitHub (auto-deploys to Vercel)
