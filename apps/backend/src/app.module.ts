// apps/backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    // Загружаем .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Добавьте CacheModule для глобального кэширования
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url: configService.get('REDIS_URL', 'redis://localhost:6379'),
          ttl: 3600, // 1 час по умолчанию
        }),
      }),
    }),

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
        logging: configService.get('NODE_ENV') === 'development',
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(private dataSource: DataSource) {} // инжектим DataSource
}
