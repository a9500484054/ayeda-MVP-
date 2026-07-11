// scripts/generate-pwa-icons.js
import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

// Размеры для PWA
const pwaSizes = [72, 96, 128, 144, 152, 192, 384, 512]

const inputFile = path.join(rootDir, 'public/logo.png')
const outputDir = path.join(rootDir, 'public/pwa-icons')

async function generatePwaIcons() {
  console.log('🔄 Генерация PWA иконок...')

  try {
    await fs.access(inputFile)
  } catch {
    console.error(`❌ Файл ${inputFile} не найден!`)
    console.log('📝 Убедитесь, что файл public/logo.png существует')
    return
  }

  await fs.mkdir(outputDir, { recursive: true })

  // Генерируем PWA иконки
  for (const size of pwaSizes) {
    const outputPath = path.join(outputDir, `pwa-${size}x${size}.png`)
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
    console.log(`✅ Сгенерирована PWA иконка ${size}x${size}`)
  }

  // Генерируем apple-touch-icon (180x180)
  const appleTouchPath = path.join(rootDir, 'public', 'apple-touch-icon.png')
  await sharp(inputFile)
    .resize(180, 180, {
      fit: 'cover',
      position: 'center'
    })
    .png({
      compressionLevel: 9,
      quality: 100
    })
    .toFile(appleTouchPath)
  console.log('✅ Сгенерирован apple-touch-icon.png')

  // Генерируем favicon (32x32 и 16x16)
  const favicon32Path = path.join(rootDir, 'public', 'favicon-32x32.png')
  await sharp(inputFile)
    .resize(32, 32, {
      fit: 'cover',
      position: 'center'
    })
    .png({
      compressionLevel: 9,
      quality: 100
    })
    .toFile(favicon32Path)
  console.log('✅ Сгенерирован favicon-32x32.png')

  const favicon16Path = path.join(rootDir, 'public', 'favicon-16x16.png')
  await sharp(inputFile)
    .resize(16, 16, {
      fit: 'cover',
      position: 'center'
    })
    .png({
      compressionLevel: 9,
      quality: 100
    })
    .toFile(favicon16Path)
  console.log('✅ Сгенерирован favicon-16x16.png')

  console.log('✅ Все PWA иконки сгенерированы!')
  console.log(`📁 Иконки сохранены в: ${outputDir}`)
}

generatePwaIcons().catch(console.error)
