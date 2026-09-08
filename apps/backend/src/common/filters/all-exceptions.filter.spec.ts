import {
  ArgumentsHost,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

function hostFor(method = 'GET', url = '/api/v1/x') {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  const req = { method, url, originalUrl: url };
  return {
    host: {
      switchToHttp: () => ({ getResponse: () => res, getRequest: () => req }),
    } as unknown as ArgumentsHost,
    res,
  };
}

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  it('HttpException → единый формат с сохранением статуса и сообщения', () => {
    const { host, res } = hostFor();
    filter.catch(new ForbiddenException('нельзя'), host);

    expect(res.statusCode).toBe(403);
    expect(res.body).toMatchObject({
      statusCode: 403,
      error: 'Forbidden',
      message: 'нельзя',
      path: '/api/v1/x',
    });
    expect((res.body as { timestamp: string }).timestamp).toEqual(
      expect.any(String),
    );
  });

  it('произвольная ошибка → 500 без утечки стека', () => {
    const { host, res } = hostFor('POST', '/api/v1/boom');
    filter.catch(new Error('internal detail'), host);

    expect(res.statusCode).toBe(500);
    const body = res.body as Record<string, unknown>;
    expect(body.statusCode).toBe(500);
    expect(JSON.stringify(body)).not.toContain('internal detail');
    expect(JSON.stringify(body)).not.toMatch(/at .*\(.*:\d+:\d+\)/); // нет стека
  });

  it('массив сообщений валидации сохраняется', () => {
    const { host, res } = hostFor();
    filter.catch(
      new HttpException(
        {
          message: ['a обязателен', 'b слишком длинный'],
          error: 'Bad Request',
        },
        400,
      ),
      host,
    );
    expect((res.body as { message: string[] }).message).toEqual([
      'a обязателен',
      'b слишком длинный',
    ]);
  });
});
