// scripts/generate-icons.js
import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const inputFile = path.join(rootDir, 'public/logo.png')
const outputDir = path.join(rootDir, 'public/icons')

async function generateIcons() {
  console.log('🔄 Генерация общих иконок проекта...')

  try {
    await fs.access(inputFile)
  } catch {
    console.error(`❌ Файл ${inputFile} не найден!`)
    console.log('📝 Убедитесь, что файл public/logo.png существует')
    return
  }

  await fs.mkdir(outputDir, { recursive: true })

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`)
    await sharp(inputFile)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .png({
        compressionLevel: 9,
        quality: 100
      })
      .toFile(outputPath)
    console.log(`✅ Сгенерирована иконка ${size}x${size}`)
  }

  console.log('✅ Все общие иконки сгенерированы!')
}

generateIcons().catch(console.error)
