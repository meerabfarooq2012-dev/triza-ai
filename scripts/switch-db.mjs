#!/usr/bin/env node
/**
 * Smart Database Switch Script (Node.js compatible)
 *
 * Automatically selects the correct Prisma schema based on DATABASE_URL:
 * - If DATABASE_URL starts with "file:" → uses SQLite schema (development/sandbox)
 * - If DATABASE_URL starts with "postgresql:" → uses PostgreSQL schema (production/Vercel)
 * - If on Vercel without DATABASE_URL → defaults to PostgreSQL (Vercel never uses SQLite)
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

function detectDatabaseType(dbUrl) {
  if (dbUrl.startsWith('file:')) {
    return 'sqlite'
  } else if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    return 'postgresql'
  }

  // On Vercel, ALWAYS default to PostgreSQL (Vercel never uses SQLite)
  if (IS_VERCEL) {
    console.log('🌐 Vercel environment detected — defaulting to PostgreSQL')
    return 'postgresql'
  }

  if (!dbUrl) {
    console.log('⚠️  No DATABASE_URL found, defaulting to SQLite')
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
    console.error('❌ Failed to run prisma generate:', error.message)
    process.exit(1)
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

console.log('━'.repeat(40))
console.log(`🎉 Database configuration complete — using ${dbType.toUpperCase()}`)
