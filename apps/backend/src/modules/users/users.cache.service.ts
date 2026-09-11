import { Injectable } from '@nestjs/common';
import { clearCachePattern, getKeysByPattern } from '../../utils/redis.utils';
import redisClient from '../../config/redis';

export interface UsersCacheStats {
  totalCachedUsers: number;
  keys: string[];
  memory: string;
}

@Injectable()
export class UsersCacheService {
  async clearUserCache(userId: string, email?: string): Promise<void> {
    // Очищаем кэш по ID
    await clearCachePattern(`user:${userId}`);

    // Очищаем кэш по email
    if (email) {
      await clearCachePattern(`user:email:${email.toLowerCase()}`);
    }

    // Очищаем все списки пользователей
    await clearCachePattern('users:all:*');
    await clearCachePattern('users:all:list');
  }

  async clearAllUsersCache(): Promise<void> {
    await clearCachePattern('user:*');
    await clearCachePattern('users:all:*');
  }

  async getCacheStats(): Promise<UsersCacheStats> {
    const keys = await getKeysByPattern('user:*');
    const info = await redisClient.info('memory');
    const match = info.match(/used_memory_human:(\d+\.?\d*\s*\w+)/);

    return {
      totalCachedUsers: keys.length,
      keys,
      memory: match ? match[1] : 'unknown',
    };
  }
}
