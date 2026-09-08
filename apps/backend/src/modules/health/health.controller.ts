import {
  Controller,
  Get,
  HttpStatus,
  Res,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import type { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import redisClient from '../../config/redis';

@ApiTags('health')
@SkipThrottle()
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Живость сервиса: БД + Redis' })
  async check(@Res({ passthrough: true }) res: Response) {
    const [db, redis] = await Promise.all([this.pingDb(), this.pingRedis()]);
    const ok = db && redis;

    if (!ok) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    return {
      status: ok ? 'ok' : 'degraded',
      db: db ? 'up' : 'down',
      redis: redis ? 'up' : 'down',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  private async pingDb(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  private async pingRedis(): Promise<boolean> {
    try {
      return (await redisClient.ping()) === 'PONG';
    } catch {
      return false;
    }
  }
}
