# Task ID: 2 - Auth Modal UX Improvements

## Summary
Improved the Auth Modal Sign-In/Sign-Up UX with 5 major enhancements to make the authentication flow more user-friendly and accessible.

## File Modified
- `/home/z/my-project/src/components/marketplace/auth/auth-modal.tsx`

## Changes Made

### 1. Error Messages More Prominent
- Added shaking animation via framer-motion `shakeVariants` (x-axis keyframes)
- Added `errorKey` state to re-trigger shake animation on repeated errors
- Added `AlertCircle` icon from lucide-react in error box
- Made error text `font-medium` with larger padding (p-4) and shadow
- Added `errorRef` + `useEffect` for auto-scrolling to error message
- Fixed dark mode: `border-red-600`, `bg-red-950/50`, `text-red-300` (brighter)

### 2. Sign-Up Form Validation UX
- Added `touchedFields` state tracking which fields have been interacted with
- Added `onBlur` handlers on all inputs calling `markTouched(fieldName)`
- Added `getInputValidationClass()` helper: red border if touched+empty, green if touched+filled
- Added `getInlineHint()` helper: animated red text with AlertCircle icon below empty touched fields
- Password requirement indicator: green Check + "Minimum 6 characters" or red X + remaining count
- Password match/mismatch indicator: green Check + "Passwords match" or red X + "Passwords don't match"
- Confirm password input gets red border on mismatch, green on match

### 3. Better Loading States
- Added prominent loading overlay with `backdrop-blur-sm` and `bg-background/60`
- Shows Loader2 spinner + contextual text ("Signing in..." / "Creating account...")
- All form inputs already had `disabled={isLoading}` — verified and preserved

### 4. Checkbox Accessibility
- Added `termsPulse` state with framer-motion scale animation (1→1.2→1→1.2→1)
- Checkbox gets red border (`border-red-400 dark:border-red-500`) when `termsError` is true
- Added red asterisk (*) after terms label to indicate required
- Terms area gets subtle red background (`bg-red-50 dark:bg-red-950/30`) on error
- Added "Please accept the terms to continue" text with AlertCircle icon below checkbox
- Label has `select-none` for better click behavior
- Error clears when checkbox is checked

### 5. Dark Mode Fixes
- Error messages: `border-red-600 bg-red-950/50 text-red-300` (was `border-red-800 bg-red-950/30 text-red-400`)
- Google buttons: added dark mode variants (`dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200`)
- Divider lines: `dark:border-gray-700`

## Lint Result
0 errors, 2 pre-existing warnings (unchanged)
