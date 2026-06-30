# TRIZA vs Thiora — File Separation Map

> Yeh document batata hai kaunsi files TRIZA (AI chatbot) ki hain aur kaunsi
> Thiora (marketplace) ki. Dono ALAG projects hain — alag repos, alag domains.
> Inhein mix nahi karna.

## Repos
- **TRIZA repo** (`triza-ai` remote): `github.com/meerabfarooq2012-dev/triza-ai`
- **Thiora repo** (`origin` remote): `github.com/meerabfarooq2012-dev/Marketo`

---

## 🟢 TRIZA AI files (AI chatbot — yeh repo ka asli maqsad)

### App routes (TRIZA)
- `src/app/page.tsx` — landing page
- `src/app/layout.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`, `sitemap.ts`
- `src/app/api/ai/*` — chat, conversations, models, seed, analyze, guide, generate-description
- `src/app/api/health/*` — health checks
- `src/app/api/feedback/*` — TRIZA feedback
- `src/app/api/csrf-token/`, `db-diagnostic/`, `deploy-info/`, `route.ts` — infra

### TRIZA engine & components
- `src/lib/triza-engine/*` — knowledge base, response generator, self-expression
- `src/lib/trinity-browser/*` — browser-side TRINITY memory
- `src/lib/ai-provider.ts`, `src/lib/gemini.ts`
- `src/components/ai/*` — landing, workspace, chat-engine
- `src/components/trinity/*` — TRINITY engine (knowledge graph, analogy, bayesian)
- `src/components/hdc/*` + `hdc-lab-button.tsx` — hyperdimensional computing
- `src/components/seo/json-ld.tsx`
- `src/hooks/use-trinity-browser.ts`

### Shared infra (dono use karte hain, TRIZA ke liye zaroori)
- `src/lib/db.ts`, `utils.ts`, `cors.ts`, `csrf.ts`, `with-csrf.ts`, `rate-limit.ts`,
  `error-handler.ts`, `sentry.ts`, `validation.ts`, `env-validation.ts`, `cache.ts`
- `src/components/ui/*` (shadcn)
- `src/hooks/use-csrf.ts`, `use-mobile.ts`, `use-toast.ts`
- `src/proxy.ts`, `src/instrumentation.ts`
- `prisma/`, `public/`, `scripts/`, config files

---

## 🔴 Thiora / Marketplace files (e-commerce — alag project)

### Marketplace API routes (Thiora)
- `src/app/api/payments/*` — payments, stripe, crypto
- `src/app/api/payment-methods/*`, `payment-info/*`
- `src/app/api/shipping/*`, `shipments/*`
- `src/app/api/disputes/*`
- `src/app/api/cart/*`
- `src/app/api/seller-tier/*`
- `src/app/api/withdrawals/*`, `wallet/*`
- `src/app/api/downloads/*`
- `src/app/api/flash-sales/*`, `coupons/*`, `tax/*`, `currency/*`
- `src/app/api/wishlists/*`, `wishlist/*`, `favorites/*`, `returns/*`
- `src/app/api/addresses/*`, `verification/*`
- `src/app/api/social/*`, `messages/*`, `search/*`, `notifications/*`, `push/*`
- `src/app/api/email/*`, `users/*`, `auth/*`, `dashboard/*`, `analytics/*`

### Marketplace lib (Thiora)
- `src/lib/stripe.ts`, `payment-gateway.ts`, `payment-methods.ts`
- `src/lib/email.ts`, `email-templates.ts`
- `src/lib/digital-subcategories.ts`, `physical-subcategories.ts`, `gig-subcategories.ts`,
  `digital-download.ts`
- `src/lib/carriers/*` — TCS, Leopards
- `src/lib/pakistan-cities.ts`, `country-codes.ts`, `currency.ts`, `invoice-pdf.ts`
- `src/lib/notifications.ts`, `web-push.ts`, `vapid-keys.ts`
- `src/lib/google-auth.ts`, `two-factor.ts`
- `src/lib/supabase.ts`, `supabase-storage.ts`, `supabase-realtime.ts`, `realtime-strategy.ts`
- `src/lib/i18n/*` — marketplace translations
- `src/lib/rbac.ts`, `session.ts`, `with-session.ts`, `auth-middleware.ts`, `audit-log.ts`
- `src/lib/security.ts`, `sanitize.ts`, `constants.ts`

---

## ⚠️ Rule
- TRIZA files mein "Thiora" branding mix NAHI karni.
- Thiora files mein "TRIZA" branding mix NAHI karni.
- Dono ki codebases alag rehna chahiye conceptually.
- Jab Thiora mein payment method add karna ho, `src/app/api/payments/*` aur
  `src/lib/payment-methods.ts` edit karna — TRIZA files ko chherna.
