import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import redisClient from '../../../config/redis';

@Injectable()
export class BlacklistGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) return true;

    // Проверяем не в blacklist ли токен
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    return true;
  }
}
