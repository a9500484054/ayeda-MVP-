// apps/backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { UnitsModule } from './modules/units/units.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { IngredientsModule } from './modules/ingredients/ingredients.module';
import { RecipesModule } from './modules/recipes/recipes.module';
import { LikesModule } from './modules/likes/likes.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { CommentsModule } from './modules/comments/comments.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { MenuPlannerModule } from './modules/menu-planner/menu-planner.module';
import { ShoppingCategoriesModule } from './modules/shopping-categories/shopping-categories.module';
import { ShoppingListsModule } from './modules/shopping-lists/shopping-lists.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { RedisModule } from './modules/redis/redis.module';
import { HealthModule } from './modules/health/health.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    // Загружаем .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Глобальный rate-limit: 120 запросов в минуту с одного IP.
    // Точечные лимиты на чувствительных ручках заданы через @Throttle.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),

    // Планировщик (крон-задачи: очистка refresh-токенов)
    ScheduleModule.forRoot(),

    // Асинхронно подключаем TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'ayeda'),
        password: configService.get('DB_PASSWORD', 'ayeda'),
        database: configService.get('DB_DATABASE', 'ayeda_dev'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: false, // false в продакшне, используем миграции
        // По умолчанию логируем только ошибки и медленные запросы.
        // Полный лог SQL — только при DB_LOGGING=true
        logging:
          configService.get('DB_LOGGING', 'false') === 'true'
            ? 'all'
            : ['error', 'warn'],
        maxQueryExecutionTime: 1000,
      }),
    }),
    UsersModule,
    EmailModule,
    AuthModule,
    UnitsModule,
    CategoriesModule,
    IngredientsModule,
    RecipesModule,
    LikesModule,
    FavoritesModule,
    CommentsModule,
    UploadsModule,
    MenuPlannerModule,
    ShoppingCategoriesModule,
    ShoppingListsModule,
    ArticlesModule,
    RedisModule,
    HealthModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {
  constructor(private dataSource: DataSource) {} // инжектим DataSource
}
