# 🚀 TRIZA — Vercel Deployment Guide

TRIZA ko Vercel par deploy karna bilkul simple hai. Chatbot **zero environment variables**
ke saath bhi kaam karta hai kyunki engine mein in-memory fallback hai.

---

## ⚡ One-Click Deploy (Sabse Aasaan Tarika)

Niche diye gaye button par click karein:

### [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/git?s=https://github.com/meerabfarooq2012-dev/triza-ai)

Ya yeh link kholiye:
**https://vercel.com/import/git?s=https://github.com/meerabfarooq2012-dev/triza-ai**

---

## 📋 Step-by-Step Instructions

### Step 1 — Vercel par login
- https://vercel.com par jayein
- **"Login with GitHub"** par click karein (same GitHub account use karein jisme `triza-ai` repo hai)

### Step 2 — Project Import
- Link kholne ke baad Vercel automatically `triza-ai` repo detect kar lega
- **"Import"** button par click karein

### Step 3 — Configure (defaults already correct)
Vercel automatically detect kar lega:
- **Framework**: Next.js ✅
- **Build Command**: `node scripts/switch-db.mjs && prisma generate && prisma db push --accept-data-loss && next build` (from `vercel.json`) ✅
- **Install Command**: `bun install` ✅
- **Output Directory**: `.next` ✅

### Step 4 — Environment Variables (OPTIONAL for chatbot)
Chatbot ke liye **koi env var zaroori nahi** — TRIZA in-memory chalti hai.

Agar chat history persist karni hai (taaki refresh ke baad bhi conversations save rahein),
toh ek PostgreSQL database add karein (recommended: **Supabase** — free tier):

| Variable | Value | Required? |
|----------|-------|-----------|
| `DATABASE_URL` | `postgresql://...` (Supabase connection string) | ❌ Optional |
| `DIRECT_URL` | Same as DATABASE_URL (without pgbouncer) | ❌ Optional |

**Note:** Bina database ke bhi TRIZA perfectly kaam karta hai — bas conversations
refresh ke baad reset ho jaate hain (in-memory).

### Step 5 — Deploy!
- **"Deploy"** button par click karein
- 2-4 minute wait karein — build complete ho jayega
- Deploy hone ke baad Vercel ek URL dega (jaise `triza-ai.vercel.app`)
- Us URL par TRIZA live ho jayegi! 🎉

---

## ✅ Kya Automatically Handle Hota Hai

1. **Database detection** — `scripts/switch-db.mjs` automatically SQLite/PostgreSQL detect karta hai.
   Bina `DATABASE_URL` ke yeh SQLite schema use karta hai (build-only) aur TRIZA runtime par
   in-memory chalti hai.
2. **Prisma client generation** — build mein automatically `prisma generate` chalta hai.
3. **Native modules** — `next.config.ts` mein `serverExternalPackages` configure hai
   (pg, bcryptjs, sharp, jsdom, etc.) taaki Vercel serverless par bundle na ho.
4. **ESLint/TypeScript** — dono build errors ignore hote hain (`ignoreDuringBuilds: true`).
5. **Sentry** — optional hai, bina config ke app normally chalta hai.

---

## 🔍 Deploy Ke Baad Verify Kaise Karein

1. Apne Vercel URL par jayein
2. Landing page load hona chahiye
3. Chatbot kholein aur "Hello! Who are you?" bhejein
4. TRIZA ka response aana chahiye (greeting + intro)
5. Try karein: "I'm feeling a bit down today" → warm emotional support response

Agar koi error aaye toh Vercel dashboard → **"Logs"** ya **"Functions"** tab check karein.

---

## 🔄 Future Updates

Jab bhi `triza-ai` repo ke `main` branch par push karein, Vercel **automatically
re-deploy** kar dega. Kuch manually karne ki zaroorat nahi.

```bash
git push triza-ai main
```

---

## ❓ Common Issues

**Q: Build fail ho gaya "prisma db push" par**
A: Yeh tab hota hai jab `DATABASE_URL` galat hai. Ya toh env var hata dein (TRIZA
in-memory chalegi) ya Sahi Supabase URL daalein.

**Q: Chatbot kaam kar raha but conversations save nahi ho rahe**
A: Iska matlab `DATABASE_URL` set nahi hai. Supabase free PostgreSQL add karein.

**Q: "Function timeout" error**
A: Vercel free tier mein 10s timeout hai. TRIZA response <1s mein aata hai, toh
yeh issue nahi aana chahiye.

---

**Deploy URL (manual):** https://vercel.com/import/git?s=https://github.com/meerabfarooq2012-dev/triza-ai
