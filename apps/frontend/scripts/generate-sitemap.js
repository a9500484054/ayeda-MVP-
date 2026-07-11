// apps/frontend/scripts/generate-sitemap.js
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import dotenv from 'dotenv'

// Загружаем .env файл
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env') })

// ============================================
// КОНФИГУРАЦИЯ ИЗ .ENV
// ============================================
const SITE_URL = process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3001'
const API_URL = process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'

const NOW = new Date().toISOString().split('T')[0]

console.log(`🌐 Site URL: ${SITE_URL}`)
console.log(`📡 API URL: ${API_URL}`)

// ============================================
// СТАТИЧЕСКИЕ СТРАНИЦЫ
// ============================================
const staticPages = [
  { loc: '/', changefreq: 'daily', priority: 1.0 },
  { loc: '/about', changefreq: 'monthly', priority: 0.5 },
  { loc: '/blog', changefreq: 'daily', priority: 0.9 },
  { loc: '/ingredients', changefreq: 'daily', priority: 0.8 },
  { loc: '/recipes', changefreq: 'daily', priority: 0.9 },
  { loc: '/support', changefreq: 'monthly', priority: 0.4 },
  { loc: '/policy', changefreq: 'yearly', priority: 0.3 },
  { loc: '/offer', changefreq: 'yearly', priority: 0.3 },
]

// ============================================
// ХЕЛПЕР ДЛЯ FETCH
// ============================================
async function safeFetch(url) {
  try {
    console.log(`📡 Запрос: ${url}`)
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.warn(`⚠️ API вернул ${response.status} для ${url}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`❌ Ошибка запроса к ${url}:`, error.message)
    return null
  }
}

// ============================================
// ФУНКЦИЯ ПОЛУЧЕНИЯ ВСЕХ СТРАНИЦ С ПАГИНАЦИЕЙ
// ============================================
async function fetchAllPages(baseUrl, params = {}) {
  const allItems = []
  let page = 1
  const limit = 100
  let hasNext = true

  while (hasNext) {
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...params,
    })

    const url = `${baseUrl}?${queryParams}`
    const data = await safeFetch(url)

    if (!data) break

    const items = data?.data || data?.items || []
    if (items.length === 0) break

    allItems.push(...items)

    // Проверяем наличие следующей страницы
    hasNext = data?.hasNext === true

    // Альтернативная проверка через pages
    if (!hasNext && data?.pages && page >= data.pages) {
      hasNext = false
    }

    page++

    // Защита от бесконечного цикла
    if (page > 50) {
      console.warn(`⚠️ Достигнут лимит страниц (50)`)
      break
    }
  }

  return allItems
}

// ============================================
// ФУНКЦИЯ ПОЛУЧЕНИЯ ДИНАМИЧЕСКИХ СТРАНИЦ
// ============================================
async function fetchDynamicUrls() {
  const dynamicUrls = []

  // ============================================================
  // 1. РЕЦЕПТЫ - используем правильный эндпоинт
  // ============================================================
  console.log('📡 Fetching recipes...')

  const recipes = await fetchAllPages(`${API_URL}/recipes`, {
    // Не передаем status, так как API возвращает все рецепты
  })

  console.log(`✅ Найдено рецептов: ${recipes.length}`)

  recipes.forEach(recipe => {
    if (recipe.srcPath) {
      dynamicUrls.push({
        loc: `/recipes/${recipe.srcPath}`,
        lastmod: recipe.updatedAt?.split('T')[0] || NOW,
        changefreq: 'weekly',
        priority: 0.8,
        image: recipe.photo?.src || null,
      })
    }
  })

  // ============================================================
  // 2. СТАТЬИ БЛОГА
  // ============================================================
  console.log('📡 Fetching articles...')

  const articles = await fetchAllPages(`${API_URL}/articles`, {
    status: 'published',
  })

  console.log(`✅ Найдено статей: ${articles.length}`)

  articles.forEach(article => {
    if (article.slug) {
      dynamicUrls.push({
        loc: `/blog/${article.slug}`,
        lastmod: article.updated_at?.split('T')[0] || NOW,
        changefreq: 'weekly',
        priority: 0.7,
        image: article.featured_image || null,
      })
    }
  })

  // ============================================================
  // 3. ИНГРЕДИЕНТЫ - используем правильный эндпоинт
  // ============================================================
  console.log('📡 Fetching ingredients...')

  const ingredients = await fetchAllPages(`${API_URL}/ingredients`)

  console.log(`✅ Найдено ингредиентов: ${ingredients.length}`)

  ingredients.forEach(ingredient => {
    if (ingredient.srcPath) {
      dynamicUrls.push({
        loc: `/ingredients/${ingredient.srcPath}`,
        lastmod: ingredient.updatedAt?.split('T')[0] || NOW,
        changefreq: 'monthly',
        priority: 0.6,
        image: ingredient.photo || null,
      })
    }
  })

  return dynamicUrls
}

// ============================================
// ГЕНЕРАЦИЯ XML
// ============================================
function generateSitemapXml(staticPages, dynamicUrls) {
  const allUrls = [...staticPages, ...dynamicUrls]

  console.log(`📊 Всего URL: ${allUrls.length} (${staticPages.length} статических + ${dynamicUrls.length} динамических)`)

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`

  allUrls.forEach(url => {
    xml += `
  <url>
    <loc>${SITE_URL}${url.loc}</loc>
    <lastmod>${url.lastmod || NOW}</lastmod>
    <changefreq>${url.changefreq || 'weekly'}</changefreq>
    <priority>${url.priority || 0.5}</priority>`

    // Добавляем изображение, если есть
    if (url.image) {
      const imageUrl = url.image.startsWith('http')
        ? url.image
        : `${SITE_URL}${url.image.startsWith('/') ? '' : '/'}${url.image}`
      xml += `
    <image:image>
      <image:loc>${imageUrl}</image:loc>
    </image:image>`
    }

    xml += `
  </url>`
  })

  xml += `
</urlset>`

  return xml
}

// ============================================
// СОХРАНЕНИЕ В ФАЙЛ
// ============================================
async function generateSitemap() {
  console.log('🚀 Starting sitemap generation...')
  console.log(`📍 Site URL: ${SITE_URL}`)

  // Получаем динамические URL
  const dynamicUrls = await fetchDynamicUrls()

  // Генерируем XML
  const xml = generateSitemapXml(staticPages, dynamicUrls)

  // Сохраняем в public
  const publicDir = join(process.cwd(), 'public')
  const outputPath = join(publicDir, 'sitemap.xml')

  try {
    if (!existsSync(publicDir)) {
      mkdirSync(publicDir, { recursive: true })
      console.log(`📁 Created public directory: ${publicDir}`)
    }

    writeFileSync(outputPath, xml, 'utf-8')
    console.log(`✅ Sitemap saved to: ${outputPath}`)
    console.log(`📄 File size: ${(xml.length / 1024).toFixed(2)} KB`)
    console.log(`📊 Total URLs: ${dynamicUrls.length + staticPages.length}`)

    if (existsSync(outputPath)) {
      console.log('✅ Sitemap file exists and is ready!')
    }
  } catch (error) {
    console.error('❌ Error saving sitemap:', error)
    process.exit(1)
  }
}

// ============================================
// ЗАПУСК
// ============================================
generateSitemap().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
