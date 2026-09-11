import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import redisClient from '../../config/redis';

export interface HealthStatus {
  ok: boolean;
  db: boolean;
  redis: boolean;
}

@Injectable()
export class HealthService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async check(): Promise<HealthStatus> {
    const [db, redis] = await Promise.all([this.pingDb(), this.pingRedis()]);
    return { ok: db && redis, db, redis };
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
