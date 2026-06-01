import { Injectable } from '@nestjs/common';
import { clearCachePattern } from '../../utils/redis.utils';

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
}
