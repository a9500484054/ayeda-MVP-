import redisClient from '../config/redis';

// Кэширование с TTL (время жизни в секундах)
export const cacheGetOrSet = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> => {
  // Пробуем получить из кэша
  const cached = await redisClient.get(key);

  if (cached) {
    return JSON.parse(cached);
  }

  // Если нет в кэше - получаем данные
  const data = await fetchFn();

  // Сохраняем в кэш
  await redisClient.setEx(key, ttlSeconds, JSON.stringify(data));

  return data;
};

// Очистка кэша по паттерну
export const clearCachePattern = async (pattern: string): Promise<void> => {
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

// Инкремент счетчика (для лимитов)
export const incrementAndGet = async (key: string, ttlSeconds?: number): Promise<number> => {
  const count = await redisClient.incr(key);

  if (ttlSeconds && count === 1) {
    await redisClient.expire(key, ttlSeconds);
  }

  return count;
};

// Установка сессии пользователя
export const setUserSession = async (
  userId: string,
  sessionData: any,
  ttlSeconds: number = 86400 // 24 часа
): Promise<void> => {
  await redisClient.setEx(`session:${userId}`, ttlSeconds, JSON.stringify(sessionData));
};

// Получение сессии
export const getUserSession = async (userId: string): Promise<any | null> => {
  const session = await redisClient.get(`session:${userId}`);
  return session ? JSON.parse(session) : null;
};
