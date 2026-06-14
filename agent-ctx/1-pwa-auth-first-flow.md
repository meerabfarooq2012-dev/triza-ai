# Task 1: PWA Auth-First Flow Developer

## Work Record

### Problem
The PWA auth-first flow had a flash of the landing page on first render in standalone mode. When a user opened the installed PWA, they briefly saw `MobileAppHome` before the useEffect redirected them to the auth screen.

### Root Cause
The `renderView` switch statement's `case 'landing':` returned `MobileAppHome` (because `shouldShowAppHome` was true in standalone mode) on the first render. The useEffect that set `currentView` to `'auth'` only ran AFTER the first render, causing the flash.

### Changes Made

#### 1. `src/app/page.tsx` — `renderView` function (line ~714)
**Before:**
```tsx
case 'landing':
default:
  return shouldShowAppHome ? <MobileAppHome /> : <LandingPage />
```

**After:**
```tsx
case 'landing':
default:
  // PWA standalone: NEVER show landing page — force auth or dashboard
  if (isStandalone) {
    if (isLoadingAuth) {
      return <PageLoader />
    }
    if (!isAuthenticated) {
      return <AuthModal />
    }
    const role = currentUser?.role
    if (role === 'admin') {
      return <AdminPanel />
    } else if (role === 'seller' || role === 'both') {
      return <SellerDashboard />
    }
    return <BuyerDashboard />
  }
  if (shouldShowAppHome) {
    return <MobileAppHome />
  }
  return <LandingPage />
```

Key improvements:
- **Synchronous guard**: The redirect now happens during render, not after via useEffect
- **Loading state**: While `isLoadingAuth` is true in standalone mode, shows `<PageLoader />` instead of the landing page — no flash
- **Unauthenticated**: Directly renders `<AuthModal />` — no landing page flash
- **Authenticated**: Directly renders the appropriate dashboard based on role
- **Non-standalone**: Behavior unchanged (mobile browser shows `MobileAppHome`, desktop shows `LandingPage`)

#### 2. Verified: `mobile-bottom-nav.tsx` — Already correct
The Home tab handler already checks `isStandalone` and redirects to auth/dashboard (lines 132-142). No changes needed.

#### 3. Verified: `auth-modal.tsx` — Already correct
- `navigateAfterAuth()` navigates to the correct dashboard based on role
- "Back to home" button is already hidden in standalone mode (`!isStandalone && ...`)
- No changes needed.

#### 4. Existing useEffect kept as safety net
The existing useEffect (lines 505-523) that redirects from 'landing' to 'auth' in standalone mode is kept as a safety net. It will still fire if somehow `currentView` gets set to 'landing' in standalone mode, but the primary guard is now in `renderView`.

### Verification
- `bun run lint`: 0 errors, 1 pre-existing warning
- Dev server running cleanly on port 3000
