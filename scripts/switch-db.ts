#!/usr/bin/env bun
/**
 * Smart Database Switch Script
 * 
 * Automatically selects the correct Prisma schema based on the DATABASE_URL:
 * - If DATABASE_URL starts with "file:" → uses SQLite schema (development/sandbox)
 * - If DATABASE_URL starts with "postgresql:" → uses PostgreSQL schema (production/Vercel)
 * 
 * This allows the same codebase to work seamlessly in both environments.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

const ROOT_DIR = join(import.meta.dir, '..')
const PRISMA_DIR = join(ROOT_DIR, 'prisma')
const SCHEMA_TARGET = join(PRISMA_DIR, 'schema.prisma')
const SCHEMA_SQLITE = join(PRISMA_DIR, 'schema.sqlite.prisma')
const SCHEMA_POSTGRESQL = join(PRISMA_DIR, 'schema.postgresql.prisma')

function getDatabaseUrl(): string {
  // Try to read from .env file first
  const envPath = join(ROOT_DIR, '.env')
  let dbUrl = process.env.DATABASE_URL || ''

  if (!dbUrl && existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8')
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim()
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) continue
      const match = trimmed.match(/^DATABASE_URL\s*=\s*["']?(.+?)["']?\s*$/)
      if (match) {
        dbUrl = match[1]
        break
      }
    }
  }

  return dbUrl
}

function detectDatabaseType(dbUrl: string): 'sqlite' | 'postgresql' {
  if (dbUrl.startsWith('file:')) {
    return 'sqlite'
  } else if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    return 'postgresql'
  }
  
  // Default to SQLite if no URL found (development fallback)
  if (!dbUrl) {
    console.log('⚠️  No DATABASE_URL found, defaulting to SQLite')
    return 'sqlite'
  }

  console.log(`⚠️  Unknown DATABASE_URL format: ${dbUrl.substring(0, 30)}..., defaulting to SQLite`)
  return 'sqlite'
}

function switchSchema(dbType: 'sqlite' | 'postgresql'): void {
  const sourceFile = dbType === 'sqlite' ? SCHEMA_SQLITE : SCHEMA_POSTGRESQL
  
  if (!existsSync(sourceFile)) {
    console.error(`❌ Source schema file not found: ${sourceFile}`)
    process.exit(1)
  }

  const sourceContent = readFileSync(sourceFile, 'utf-8')
  
  // Check if current schema.prisma already matches
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

function runPrismaGenerate(): void {
  try {
    console.log('⚙️  Running prisma generate...')
    execSync('npx prisma generate', { 
      cwd: ROOT_DIR, 
      stdio: 'inherit',
      timeout: 60000 
    })
    console.log('✅ Prisma client generated successfully')
  } catch (error) {
    console.error('❌ Failed to run prisma generate:', error)
    process.exit(1)
  }
}

// Main execution
console.log('🔀 Database Switch Script')
console.log('━'.repeat(40))

const dbUrl = getDatabaseUrl()
const dbType = detectDatabaseType(dbUrl)

console.log(`📋 DATABASE_URL: ${dbUrl ? dbUrl.substring(0, 50) + (dbUrl.length > 50 ? '...' : '') : '(not set)'}`)
console.log(`🗄️  Detected database type: ${dbType.toUpperCase()}`)
console.log('━'.repeat(40))

switchSchema(dbType)
runPrismaGenerate()

console.log('━'.repeat(40))
console.log(`🎉 Database configuration complete — using ${dbType.toUpperCase()}`)
