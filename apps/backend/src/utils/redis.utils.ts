import redisClient from '../config/redis';

// Кэширование с TTL (время жизни в секундах)
export const cacheGetOrSet = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 3600,
): Promise<T> => {
  // Пробуем получить из кэша
  const cached = await redisClient.get(key);

  if (cached !== null && cached !== undefined) {
    try {
      return JSON.parse(cached) as T;
    } catch {
      // Битое значение в кэше — игнорируем и перечитываем из источника
    }
  }

  // Если нет в кэше - получаем данные
  const data = await fetchFn();

  // null/undefined не кэшируем, чтобы не залипал «промах»
  if (data !== null && data !== undefined) {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
  }

  return data;
};

// Получение всех ключей по паттерну — через неблокирующий SCAN (KEYS блокирует Redis)
export const getKeysByPattern = async (pattern: string): Promise<string[]> => {
  const keys: string[] = [];
  for await (const key of redisClient.scanIterator({
    MATCH: pattern,
    COUNT: 200,
  })) {
    if (Array.isArray(key)) {
      keys.push(...key);
    } else {
      keys.push(key);
    }
  }
  return keys;
};

// Очистка кэша по паттерну — через неблокирующий SCAN (KEYS блокирует Redis)
export const clearCachePattern = async (pattern: string): Promise<void> => {
  const keys: string[] = [];
  for await (const key of redisClient.scanIterator({
    MATCH: pattern,
    COUNT: 200,
  })) {
    if (Array.isArray(key)) {
      keys.push(...key);
    } else {
      keys.push(key);
    }
  }
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

// Инкремент счетчика (для лимитов)
export const incrementAndGet = async (
  key: string,
  ttlSeconds?: number,
): Promise<number> => {
  const count = await redisClient.incr(key);

  if (ttlSeconds && count === 1) {
    await redisClient.expire(key, ttlSeconds);
  }

  return count;
};

// Одноразовый маркер с TTL: true — если ключа не было и он установлен сейчас
// (используется для дедупликации, напр. счётчика просмотров по IP)
export const setOnce = async (
  key: string,
  ttlSeconds: number,
): Promise<boolean> => {
  const res = await redisClient.set(key, '1', { NX: true, EX: ttlSeconds });
  return res === 'OK';
};

// Установка сессии пользователя
export const setUserSession = async (
  userId: string,
  sessionData: Record<string, unknown>,
  ttlSeconds: number = 86400, // 24 часа
): Promise<void> => {
  await redisClient.setEx(
    `session:${userId}`,
    ttlSeconds,
    JSON.stringify(sessionData),
  );
};

// Получение сессии
export const getUserSession = async (
  userId: string,
): Promise<Record<string, unknown> | null> => {
  const session = await redisClient.get(`session:${userId}`);
  return session ? (JSON.parse(session) as Record<string, unknown>) : null;
};
