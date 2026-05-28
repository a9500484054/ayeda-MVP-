/**
 * Валидация YouTube URL
 * @param url - URL для проверки
 * @returns true если URL валидный YouTube
 */
export function validateYouTubeUrl(url: string): boolean {
  if (!url) return true

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

  if (url.includes('youtu.be')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
  } else if (url.includes('shorts/')) {
    videoId = url.split('shorts/')[1]?.split('?')[0] || ''
  } else if (url.includes('watch?v=')) {
    videoId = url.split('watch?v=')[1]?.split('&')[0] || ''
  } else if (url.includes('embed/')) {
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

  if (url.includes('youtu.be')) {
    return url.split('youtu.be/')[1]?.split('?')[0] || null
  }
  if (url.includes('shorts/')) {
    return url.split('shorts/')[1]?.split('?')[0] || null
  }
  if (url.includes('watch?v=')) {
    return url.split('watch?v=')[1]?.split('&')[0] || null
  }
  if (url.includes('embed/')) {
    return url.split('embed/')[1]?.split('?')[0] || null
  }

  return null
}

// ==================== VK Video ====================

/**
 * Валидация VK Video URL
 * @param url - URL для проверки
 * @returns true если URL валидный VK Video
 */
export function validateVkUrl(url: string): boolean {
  if (!url) return true;

  const patterns = [
    // vk.com домен
    /vk\.com\/video(-?\d+_\d+)/,
    /vk\.com\/video-?\d+_\d+/,
    /vk\.com\/(?:video|clip)(-?\d+_\d+)/,
    /vk\.com\/video(-?\d+_\d+)(?:\?.*)?$/,
    // ссылки с ?z=video-...
    /vk\.com\/.*[?&]z=video(-?\d+_\d+)/,
    /vk\.com\/vkvideo\?z=video(-?\d+_\d+)/,
    // общий паттерн для любых параметров
    /[?&]z=video(-?\d+_\d+)/,
    // vkvideo.ru домен (новый)
    /vkvideo\.ru\/video(-?\d+_\d+)/,
    /vkvideo\.ru\/video-?\d+_\d+/,
    /vkvideo\.ru\/(?:video|clip)(-?\d+_\d+)/,
    /vkvideo\.ru\/video(-?\d+_\d+)(?:\?.*)?$/,
    // vkvideo.ru с параметрами
    /vkvideo\.ru\/.*[?&]z=video(-?\d+_\d+)/,
    /vkvideo\.ru\/vkvideo\?z=video(-?\d+_\d+)/
  ];

  return patterns.some(pattern => pattern.test(url));
}

/**
 * Получение embed URL для VK Video
 * @param url - VK URL
 * @returns embed URL или null
 */
export function getVkEmbedUrl(url: string): string | null {
  if (!validateVkUrl(url)) return null;

  // Извлекаем ID видео из разных форматов
  let videoId: string | null = null;

  // Формат: ...?z=video-220754053_456246043
  const zMatch = url.match(/[?&]z=video(-?\d+_\d+)/);
  if (zMatch && zMatch[1]) {
    videoId = zMatch[1];
  }

  // Формат: .../video-220754053_456246043
  if (!videoId) {
    const directMatch = url.match(/video(-?\d+_\d+)/);
    if (directMatch && directMatch[1]) {
      videoId = directMatch[1];
    }
  }

  if (!videoId) return null;

  const [ownerId, videoIdNum] = videoId.split('_');
  // Для отрицательных ownerId (сообщества) оставляем минус
  const cleanOwnerId = ownerId.startsWith('-') ? ownerId : `-${ownerId}`;

  return `https://vk.com/video_ext.php?oid=${cleanOwnerId}&id=${videoIdNum}`;
}

/**
 * Получение ID видео из VK URL
 * @param url - VK URL
 * @returns ID видео или null
 */
export function getVkVideoId(url: string): string | null {
  if (!validateVkUrl(url)) return null;

  const match = url.match(/video(-?\d+_\d+)/);
  return match ? match[1] : null;
}

// ==================== Rutube ====================

/**
 * Валидация Rutube URL
 * @param url - URL для проверки
 * @returns true если URL валидный Rutube
 */
export function validateRutubeUrl(url: string): boolean {
  if (!url) return true

  const patterns = [
    /rutube\.ru\/video\/([a-f0-9]+)/,
    /rutube\.ru\/video\/embed\/([a-f0-9]+)/,
    /rutube\.ru\/play\/embed\/([a-f0-9]+)/,
    /^https?:\/\/(www\.)?rutube\.ru\/video\/([a-f0-9]+)/
  ]

  return patterns.some(pattern => pattern.test(url))
}

/**
 * Получение embed URL для Rutube
 * @param url - Rutube URL
 * @returns embed URL или null
 */
export function getRutubeEmbedUrl(url: string): string | null {
  if (!validateRutubeUrl(url)) return null

  let videoId = ''

  if (url.includes('/video/')) {
    videoId = url.split('/video/')[1]?.split('?')[0] || ''
  } else if (url.includes('/embed/')) {
    videoId = url.split('/embed/')[1]?.split('?')[0] || ''
  }

  return videoId ? `https://rutube.ru/play/embed/${videoId}` : null
}

/**
 * Получение ID видео из Rutube URL
 * @param url - Rutube URL
 * @returns ID видео или null
 */
export function getRutubeVideoId(url: string): string | null {
  if (!validateRutubeUrl(url)) return null

  const patterns = [
    /rutube\.ru\/video\/([a-f0-9]+)/,
    /rutube\.ru\/embed\/([a-f0-9]+)/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  return null
}

// ==================== Общие функции ====================

/**
 * Определение платформы видео по URL
 * @param url - URL видео
 * @returns название платформы или null
 */
export function detectVideoPlatform(url: string): 'youtube' | 'vk' | 'rutube' | null {
  if (!url) return null

  if (validateYouTubeUrl(url)) return 'youtube'
  if (validateVkUrl(url)) return 'vk'
  if (validateRutubeUrl(url)) return 'rutube'

  return null
}

/**
 * Получение embed URL для любой поддерживаемой платформы
 * @param url - URL видео
 * @returns embed URL или null
 */
export function getEmbedUrl(url: string): string | null {
  const platform = detectVideoPlatform(url)

  switch (platform) {
    case 'youtube':
      return getYouTubeEmbedUrl(url)
    case 'vk':
      return getVkEmbedUrl(url)
    case 'rutube':
      return getRutubeEmbedUrl(url)
    default:
      return null
  }
}

/**
 * Валидация URL любой поддерживаемой платформы
 * @param url - URL для проверки
 * @returns true если URL валидный
 */
export function validateVideoUrl(url: string): boolean {
  if (!url) return true

  return validateYouTubeUrl(url) || validateVkUrl(url) || validateRutubeUrl(url)
}

// Сохраняем старые функции для обратной совместимости
export { validateYouTubeUrl as validateYoutubeUrl }
