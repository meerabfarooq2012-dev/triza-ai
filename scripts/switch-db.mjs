#!/usr/bin/env node
/**
 * Smart Database Switch Script (Node.js compatible)
 *
 * Automatically selects the correct Prisma schema based on DATABASE_URL:
 * - If DATABASE_URL starts with "file:"         -> SQLite schema
 * - If DATABASE_URL starts with "postgresql:"   -> PostgreSQL schema
 * - If on Vercel WITHOUT a real DATABASE_URL    -> SQLite fallback (build-only)
 *   (TRIZA runs fully in-memory when no DB is configured, so the schema
 *    is only needed so `prisma generate` can produce @prisma/client.)
 *
 * On Vercel: Only uses process.env.DATABASE_URL (never reads .env file)
 * On Local: Falls back to .env file if DATABASE_URL not in environment
 *
 * Works with both Bun and Node.js.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ROOT_DIR = join(__dirname, '..')
const PRISMA_DIR = join(ROOT_DIR, 'prisma')
const SCHEMA_TARGET = join(PRISMA_DIR, 'schema.prisma')
const SCHEMA_SQLITE = join(PRISMA_DIR, 'schema.sqlite.prisma')
const SCHEMA_POSTGRESQL = join(PRISMA_DIR, 'schema.postgresql.prisma')

// Detect if we're running on Vercel
const IS_VERCEL = !!process.env.VERCEL || !!process.env.VERCEL_ENV

function getDatabaseUrl() {
  // Always check process.env first
  let dbUrl = process.env.DATABASE_URL || ''

  // Strip surrounding quotes that are sometimes accidentally included when
  // pasting a URL into the Vercel env-var dashboard. A value like
  //   "postgresql://user:pass@host/db"
  // (with the literal double-quotes) would otherwise break Prisma parsing.
  if (dbUrl) {
    dbUrl = dbUrl.trim().replace(/^["'`]+|["'`]+$/g, '')
  }

  // On Vercel, ONLY use process.env (never fall back to .env file)
  // This prevents the SQLite .env from overriding Vercel's PostgreSQL env var
  if (dbUrl) {
    return dbUrl
  }

  // On local development, fall back to .env file
  if (!IS_VERCEL) {
    const envPath = join(ROOT_DIR, '.env')
    if (existsSync(envPath)) {
      const envContent = readFileSync(envPath, 'utf-8')
      for (const line of envContent.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const match = trimmed.match(/^DATABASE_URL\s*=\s*["']?(.+?)["']?\s*$/)
        if (match) {
          dbUrl = match[1]
          break
        }
      }
    }
  }

  return dbUrl
}

/**
 * Returns true only when DATABASE_URL is a real, usable connection string.
 * Empty string, "file:" with no path, or whitespace is treated as missing.
 */
function hasRealDatabaseUrl(dbUrl) {
  if (!dbUrl) return false
  const trimmed = dbUrl.trim()
  if (!trimmed) return false
  if (trimmed === 'file:' || trimmed === 'file://') return false
  return true
}

function detectDatabaseType(dbUrl) {
  if (dbUrl.startsWith('file:')) {
    return 'sqlite'
  } else if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    return 'postgresql'
  }

  // No real DATABASE_URL anywhere.
  // ALWAYS fall back to SQLite — this is safe for `prisma generate`
  // (which does not connect to the DB) and lets the build succeed.
  // TRIZA itself runs in-memory when no DB is reachable, so a real
  // connection is not required for the AI to work.
  if (!hasRealDatabaseUrl(dbUrl)) {
    console.log('⚠️  No usable DATABASE_URL found — falling back to SQLite schema (build-only).')
    console.log('   TRIZA will run in-memory at runtime; no database connection required.')
    return 'sqlite'
  }

  console.log(`⚠️  Unknown DATABASE_URL format: ${dbUrl.substring(0, 30)}..., defaulting to SQLite`)
  return 'sqlite'
}

function switchSchema(dbType) {
  const sourceFile = dbType === 'sqlite' ? SCHEMA_SQLITE : SCHEMA_POSTGRESQL

  if (!existsSync(sourceFile)) {
    console.error(`❌ Source schema file not found: ${sourceFile}`)
    console.error('   Available files:')
    try {
      readdirSync(PRISMA_DIR).forEach(f => console.error(`   - ${f}`))
    } catch (e) {}
    process.exit(1)
  }

  const sourceContent = readFileSync(sourceFile, 'utf-8')

  if (existsSync(SCHEMA_TARGET)) {
    const currentContent = readFileSync(SCHEMA_TARGET, 'utf-8')
    if (currentContent === sourceContent) {
      console.log(`✅ schema.prisma already matches ${dbType} — no changes needed`)
      return
    }
  }

  writeFileSync(SCHEMA_TARGET, sourceContent, 'utf-8')
  console.log(`🔄 Switched prisma/schema.prisma to ${dbType.toUpperCase()}`)
}

function runPrismaGenerate() {
  try {
    console.log('⚙️  Running prisma generate...')
    execSync('npx prisma generate', {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      timeout: 60000
    })
    console.log('✅ Prisma client generated successfully')
  } catch (error) {
    console.error('⚠️  Failed to run prisma generate:', error.message)
    console.error('   Continuing build — prisma generate will be retried in the build command.')
    // DON'T exit — let the build command's explicit `prisma generate` handle it
  }
}

function runPrismaDbPush(dbUrl) {
  // Only push schema on Vercel builds to keep database in sync
  // SKIP during postinstall — only run during the actual build step
  const isBuildStep = process.env.VERCEL_BUILD_STEP === '1' ||
    process.env.npm_lifecycle_event === 'vercel-build' ||
    process.env.npm_lifecycle_event === 'build'

  if (!IS_VERCEL) return
  if (!isBuildStep) {
    console.log('⏭️  Skipping prisma db push in postinstall — will run during build step')
    return
  }

  // CRITICAL: If there is no real DATABASE_URL, do NOT attempt prisma db push.
  // prisma db push tries to connect to the DB and will fail with P1013
  // ("scheme not recognized") when the URL is empty. TRIZA does not need a
  // live DB — it runs from an in-memory store — so we skip this safely.
  if (!hasRealDatabaseUrl(dbUrl)) {
    console.log('⏭️  Skipping prisma db push — no DATABASE_URL configured (TRIZA runs in-memory)')
    return
  }

  // Safety net: if DIRECT_URL is not set, fall back to DATABASE_URL.
  // The schema now uses directUrl = env("DATABASE_URL") so this is rarely
  // needed, but we set it here too in case an older schema.prisma is cached
  // or Vercel runs `prisma db push` as a separate explicit command.
  if (!process.env.DIRECT_URL && !process.env.npm_config_DIRECT_URL) {
    process.env.DIRECT_URL = dbUrl
    console.log('🔗 DIRECT_URL not set — using DATABASE_URL as fallback for directUrl')
  }

  try {
    console.log('📤 Pushing schema to database (Vercel build)...')
    execSync('npx prisma db push --accept-data-loss', {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      timeout: 120000,
      env: { ...process.env }
    })
    console.log('✅ Database schema pushed successfully')
  } catch (error) {
    console.warn('⚠️  Failed to push schema to database:', error.message)
    console.warn('   The app may still work if the schema is already up to date.')
    // Don't exit — the build can still succeed if the schema was already pushed
  }
}

// Main execution
console.log('🔀 Database Switch Script')
console.log('━'.repeat(40))
if (IS_VERCEL) {
  console.log('🌐 Detected Vercel environment — using Vercel env vars only')
}

const dbUrl = getDatabaseUrl()
const dbType = detectDatabaseType(dbUrl)

console.log(`📋 DATABASE_URL: ${dbUrl ? dbUrl.substring(0, 50) + (dbUrl.length > 50 ? '...' : '') : '(not set)'}`)
console.log(`🗄️  Detected database type: ${dbType.toUpperCase()}`)
console.log('━'.repeat(40))

switchSchema(dbType)
runPrismaGenerate()
runPrismaDbPush(dbUrl)

console.log('━'.repeat(40))
console.log(`🎉 Database configuration complete — using ${dbType.toUpperCase()}`)
