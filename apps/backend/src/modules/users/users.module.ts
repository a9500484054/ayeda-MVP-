// apps/backend/src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersCacheService } from './users.cache.service'; // Добавьте
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UsersCacheService], // Добавьте UsersCacheService
  exports: [UsersService, UsersCacheService], // Экспортируйте если нужно в других модулях
})
export class UsersModule {}
