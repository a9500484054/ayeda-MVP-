import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const inputFile = 'public/logo.png' // Ваш исходный логотип
const outputDir = 'public/icons'

async function generateIcons() {
  await fs.mkdir(outputDir, { recursive: true })

  for (const size of sizes) {
    await sharp(inputFile)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
    console.log(`✅ Generated ${size}x${size} icon`)
  }
}

generateIcons().catch(console.error)
