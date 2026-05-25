/**
 * Валидация YouTube URL
 * @param url - URL для проверки
 * @returns true если URL валидный YouTube
 */
export function validateYouTubeUrl(url: string): boolean {
  if (!url) return true // Пустая строка валидна (видео не обязательно)

  const patterns = [
    /(youtu\.be\/|youtube\.com\/(watch\?v=|embed\/|v\/|shorts\/))([^?&"'>]+)/,
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /^https?:\/\/(www\.)?youtu\.be\/([^?]+)/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/([^?]+)/,
    /^https?:\/\/(www\.)?youtube\.com\/shorts\/([^?]+)/
  ]

  return patterns.some(pattern => pattern.test(url))
}

/**
 * Получение embed URL для YouTube
 * @param url - YouTube URL
 * @returns embed URL или null
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  if (!validateYouTubeUrl(url)) return null

  let videoId = ''

  // youtu.be/xxxxx
  if (url.includes('youtu.be')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
  }
  // youtube.com/shorts/xxxxx
  else if (url.includes('shorts/')) {
    videoId = url.split('shorts/')[1]?.split('?')[0] || ''
  }
  // youtube.com/watch?v=xxxxx
  else if (url.includes('watch?v=')) {
    videoId = url.split('watch?v=')[1]?.split('&')[0] || ''
  }
  // youtube.com/embed/xxxxx
  else if (url.includes('embed/')) {
    videoId = url.split('embed/')[1]?.split('?')[0] || ''
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : null
}

/**
 * Получение ID видео из YouTube URL
 * @param url - YouTube URL
 * @returns ID видео или null
 */
export function getYouTubeVideoId(url: string): string | null {
  if (!validateYouTubeUrl(url)) return null

  // youtu.be/xxxxx
  if (url.includes('youtu.be')) {
    return url.split('youtu.be/')[1]?.split('?')[0] || null
  }
  // youtube.com/shorts/xxxxx
  if (url.includes('shorts/')) {
    return url.split('shorts/')[1]?.split('?')[0] || null
  }
  // youtube.com/watch?v=xxxxx
  if (url.includes('watch?v=')) {
    return url.split('watch?v=')[1]?.split('&')[0] || null
  }
  // youtube.com/embed/xxxxx
  if (url.includes('embed/')) {
    return url.split('embed/')[1]?.split('?')[0] || null
  }

  return null
}

/**
 * Валидация Vimeo URL
 * @param url - URL для проверки
 * @returns true если URL валидный Vimeo
 */
export function validateVimeoUrl(url: string): boolean {
  if (!url) return true

  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/
  ]

  return patterns.some(pattern => pattern.test(url))
}
