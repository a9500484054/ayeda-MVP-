/**
 * Резолвит относительный путь к медиа (аватар, фото рецепта и т.п.) в абсолютный
 * URL на базе config.public.apiUrl. Уже абсолютные URL (http/https) возвращаются
 * без изменений.
 */
export function useImageUrl() {
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiUrl || 'http://localhost:3001'

  const resolveImageUrl = (path?: string | null): string => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return path.startsWith('/') ? `${apiUrl}${path}` : `${apiUrl}/${path}`
  }

  return { apiUrl, resolveImageUrl }
}
