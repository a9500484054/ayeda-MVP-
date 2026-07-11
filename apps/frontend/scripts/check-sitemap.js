// apps/frontend/scripts/check-sitemap.js
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const sitemapPath = join(process.cwd(), 'public', 'sitemap.xml')

console.log('🔍 Checking sitemap...')

if (!existsSync(sitemapPath)) {
  console.error('❌ sitemap.xml not found!')
  process.exit(1)
}

const xml = readFileSync(sitemapPath, 'utf-8')

// Проверяем наличие обязательных тегов
const hasUrlset = xml.includes('<urlset')
const hasUrls = xml.includes('<url>')
const hasLoc = xml.includes('<loc>')

console.log('📊 Sitemap check results:')
console.log(`  ✅ URLset tag: ${hasUrlset ? '✅' : '❌'}`)
console.log(`  ✅ URL tags: ${hasUrls ? '✅' : '❌'}`)
console.log(`  ✅ Loc tags: ${hasLoc ? '✅' : '❌'}`)

// Считаем количество URL
const urlCount = (xml.match(/<url>/g) || []).length
console.log(`  📄 Total URLs: ${urlCount}`)

// Проверяем наличие динамических страниц
const hasRecipes = xml.includes('/recipes/')
const hasBlog = xml.includes('/blog/')
const hasIngredients = xml.includes('/ingredients/')

console.log(`  🍽️  Recipes: ${hasRecipes ? '✅' : '❌'}`)
console.log(`  📝 Blog: ${hasBlog ? '✅' : '❌'}`)
console.log(`  🥕 Ingredients: ${hasIngredients ? '✅' : '❌'}`)

// Проверяем правильность URL
const wrongUrls = xml.match(/localhost/g)
if (wrongUrls) {
  console.warn(`⚠️  Found ${wrongUrls.length} localhost URLs!`)
} else {
  console.log('  ✅ No localhost URLs found')
}

console.log('\n✅ Sitemap check completed!')
