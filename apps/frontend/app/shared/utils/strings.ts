/**
 * Транслитерация русского текста в латиницу
 * @param text - текст на русском
 * @returns транслитерированный текст
 */
export function transliterateRussian(text: string): string {
  const ruAlphabet: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
    'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '',
    'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
  }

  return text
    .split('')
    .map(char => ruAlphabet[char] || char)
    .join('')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

/**
 * Склонение слов в зависимости от числа
 * @param count - число
 * @param words - массив форм: [1, 2-4, 5+]
 * @returns правильная форма слова
 * @example getDeclension(5, ['рецепт', 'рецепта', 'рецептов']) // 'рецептов'
 */
export function getDeclension(count: number, words: [string, string, string]): string {
  const cases = [2, 0, 1, 1, 1, 2]
  const n = Math.abs(count)
  const index = n % 100 > 4 && n % 100 < 20 ? 2 : cases[n % 10 < 5 ? n % 10 : 5]
  return words[index]
}

/**
 * Капитализация первой буквы
 * @param text - текст
 * @returns текст с заглавной первой буквой
 */
export function capitalizeFirstLetter(text: string): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Обрезка строки до лимита
 * @param text - текст
 * @param limit - максимальная длина
 * @param suffix - суффикс (по умолчанию '...')
 * @returns обрезанный текст
 */
export function truncate(text: string, limit: number, suffix: string = '...'): string {
  if (!text || text.length <= limit) return text
  return text.slice(0, limit).trim() + suffix
}

/**
 * Slugify текст для URL
 * @param text - текст
 * @returns slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Проверка на пустую строку
 * @param value - значение
 * @returns true если пустая
 */
export function isEmptyString(value: unknown): boolean {
  return value === null || value === undefined || String(value).trim() === ''
}
