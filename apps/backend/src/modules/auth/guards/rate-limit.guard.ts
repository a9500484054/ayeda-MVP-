import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { incrementAndGet } from '../../../utils/redis.utils';

@Injectable()
export class RateLimitGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const email = request.body.email;

    if (!email) return true;

    const key = `login:attempts:${email}`;
    const attempts = await incrementAndGet(key, 900); // 15 минут

    if (attempts > 5) {
      throw new HttpException(
        'Слишком много попыток входа. Попробуйте через 15 минут.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
