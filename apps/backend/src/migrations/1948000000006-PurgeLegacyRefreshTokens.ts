import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Этап 4 харденинга: refresh-токены теперь хэшируются SHA-256 вместо argon2.
 * Старые записи с argon2-хэшами больше не сматчатся ни с одним токеном —
 * удаляем их, чтобы таблица не несла мёртвый груз. Пользователи один раз
 * перелогинятся (access-токены на 15 минут не затронуты).
 */
export class PurgeLegacyRefreshTokens1948000000006 implements MigrationInterface {
  name = 'PurgeLegacyRefreshTokens1948000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "refresh_tokens"`);
  }

  public async down(): Promise<void> {
    // Необратимо: удалённые токены не восстанавливаем
  }
}
