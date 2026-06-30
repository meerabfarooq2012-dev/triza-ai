/**
 * Resize the generated 1024x1024 TRIZA icon into the sizes referenced by
 * layout.tsx / manifest.json:
 *   - icon-512x512.png   (512x512)
 *   - icon-192x192.png   (192x192)
 *   - apple-touch-icon.png (180x180)
 * Also installs the new OG banner as og-image.png.
 *
 * Run: bun run scripts/resize-triza-icons.ts
 */
import sharp from 'sharp'
import { readFileSync, writeFileSync, renameSync, existsSync } from 'fs'
import { join } from 'path'

const PUB = join(process.cwd(), 'public')
const SRC_ICON = join(PUB, 'triza-icon-1024.png')
const SRC_OG = join(PUB, 'triza-og-1344x768.png')

async function main() {
  if (!existsSync(SRC_ICON)) {
    throw new Error(`Missing source icon: ${SRC_ICON}`)
  }
  if (!existsSync(SRC_OG)) {
    throw new Error(`Missing source OG: ${SRC_OG}`)
  }

  const iconBuf = readFileSync(SRC_ICON)
  const ogBuf = readFileSync(SRC_OG)

  // 1. Replace favicon / app icons
  await sharp(iconBuf).resize(512, 512).png().toFile(join(PUB, 'icon-512x512.png'))
  console.log('✓ icon-512x512.png')

  await sharp(iconBuf).resize(192, 192).png().toFile(join(PUB, 'icon-192x192.png'))
  console.log('✓ icon-192x192.png')

  await sharp(iconBuf).resize(180, 180).png().toFile(join(PUB, 'apple-touch-icon.png'))
  console.log('✓ apple-touch-icon.png')

  // Also refresh logo.png (used in some places) with the 512 version
  await sharp(iconBuf).resize(512, 512).png().toFile(join(PUB, 'logo.png'))
  console.log('✓ logo.png')

  // 2. Replace OG banner
  await sharp(ogBuf).png().toFile(join(PUB, 'og-image.png'))
  console.log('✓ og-image.png')

  // 3. Clean up temp source files (keep repo tidy)
  renameSync(SRC_ICON, join(PUB, '.triza-icon-1024-src.png'))
  renameSync(SRC_OG, join(PUB, '.triza-og-src.png'))
  console.log('✓ archived sources')

  console.log('\n🎉 TRIZA icons installed.')
}

main().catch((e) => {
  console.error('✗ resize failed:', e)
  process.exit(1)
})
