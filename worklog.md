---
Task ID: 1
Agent: Main
Task: Fix "ew is not a function" error on sign-in page and admin settings "Authentication Required" issue

Work Log:
- Identified root cause: Zustand store `merge` function allows corrupted localStorage data to override action functions with non-function values
- When `login(user)` is called after auth, it throws "TypeError: login is not a function" which in production is minified to "ew is not a function"
- Fixed `use-marketplace-store.ts` merge function to strip non-function values for action keys
- Fixed `auth-modal.tsx` to use individual Zustand selectors instead of destructuring the entire store
- Added defensive check in handleLogin to detect corrupted store and auto-clear localStorage
- Added onRehydrateStorage validation to detect and auto-recover from corrupted store
- Fixed admin-settings.tsx to use authToken as backup validation for auth checks
- Installed missing isomorphic-dompurify dependency
- Committed and pushed to main branch

Stage Summary:
- Root cause: Corrupted localStorage data overriding Zustand action functions
- Key fix: merge() function now strips non-function values for action keys before merging
- Secondary fix: Individual selectors prevent the issue at the component level
- Pushed commit 7e3b33b to origin/main
