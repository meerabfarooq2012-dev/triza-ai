# Task 5 — Security Fix: Replace Regex HTML Sanitizer with DOMPurify

**Date:** 2025-03-05
**Agent:** security-agent

## Summary

Replaced the regex-based `sanitizeHtml` function in `/home/z/my-project/src/lib/sanitize.ts` with DOMPurify (via `isomorphic-dompurify`) for proper HTML sanitization that is resistant to XSS bypass techniques. Also added a new `sanitizeUrl` function for URL protocol validation.

## Problem

The original `sanitizeHtml` used three regex replacements which are trivially bypassed:
- `<script>` tag removal via regex can be bypassed with malformed tags, nested tags, or encoding tricks
- `on\w+="..."` only catches double-quoted event handlers (not unquoted or backtick-wrapped)
- `javascript:` removal doesn't handle `data:`, `vbscript:`, or mixed-case schemes

## Changes Made

### 1. Installed `isomorphic-dompurify` (v3.16.0)
- Works on both server (Node.js) and client (browser)
- Includes its own TypeScript types (no separate `@types/` package needed — `@types/isomorphic-dompurify` doesn't exist on npm)
- DOMPurify is the industry-standard HTML sanitizer (used by Google, Microsoft, Meta)

### 2. Updated `sanitizeHtml` function
- **Same function signature**: `(input: string) => string` — no breaking changes for existing callers
- **DOMPurify config** (applied on every call for thread safety):
  - `ALLOW_TAGS`: b, i, em, strong, a, p, br, ul, ol, li, h1-h6, blockquote, code, pre, span, div, img, hr, table, thead, tbody, tr, th, td
  - `ALLOW_ATTR`: href, src, alt, title, class, target, rel
  - `FORBID_TAGS`: style, script, iframe, object, embed, form, input, textarea, button, base, link, meta
  - `FORBID_ATTR`: onerror, onload, onclick, onmouseover, onfocus, onblur, onmousedown, onmouseup, onkeydown, onkeyup, onkeypress, onchange, onsubmit, onreset, onabort, onresize
  - `ALLOW_DATA_ATTR: false` — strips all `data-*` attributes
- **Style attribute stripping**: Added a DOMPurify `uponSanitizeElement` hook that removes the `style` attribute from all elements (prevents CSS injection via `style="background:url(javascript:...)"` or `style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;background:red"`)
- **Security improvement**: DOMPurify strips `target` attribute by default unless `rel="noopener"` is also present — this prevents tab-nabbing attacks (a security improvement over the old regex approach)

### 3. Added `sanitizeUrl` function
- Validates URLs use only safe protocols: `http:`, `https:`, `mailto:`
- Blocks dangerous protocols: `javascript:`, `data:`, `vbscript:`
- Case-insensitive protocol matching (blocks `JAVASCRIPT:`, `JavaScript:`, etc.)
- Strips leading control characters that could mask dangerous schemes
- Allows relative URLs (no protocol) like `/path/to/page`
- Returns the cleaned URL if safe, empty string if dangerous

### 4. All other functions unchanged
- `sanitizeString`, `isValidEmail`, `isStrongPassword`, `normalizeEmail`, `isPositiveNumber` — unchanged

## XSS Protection Verification

All test cases pass:

| Input | Result |
|-------|--------|
| `<img onerror=alert(1)>` | `<img>` ✅ (onerror stripped) |
| `<script>alert(1)</script>` | `` ✅ (script tag removed) |
| `<a href="javascript:alert(1)">` | `<a>click</a>` ✅ (javascript: href stripped) |
| `<a href="JAVASCRIPT:alert(1)">` | `<a>click</a>` ✅ (case-insensitive) |
| `<div style="background:url(javascript:alert(1))">` | `<div>test</div>` ✅ (style stripped) |
| `<iframe src="https://evil.com">` | `` ✅ (iframe removed) |
| `<form><input><button>` | `submit` ✅ (form elements removed) |
| `<div data-custom="evil">` | `<div>test</div>` ✅ (data attrs removed) |
| `<p onclick="alert(1)">` | `<p>click me</p>` ✅ (onclick stripped) |
| Safe HTML preserved | ✅ |

## Lint Results
- 0 new errors, 0 new warnings
- 3 pre-existing warnings in unrelated files
