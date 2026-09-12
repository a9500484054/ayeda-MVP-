import { Logger, InternalServerErrorException } from '@nestjs/common';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: number | string;
  method: string;
  params?: any;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: any;
  error?: { code: number; message: string; data?: any };
}

export class VkusvillMcpClient {
  private readonly logger = new Logger(VkusvillMcpClient.name);
  private sessionId: string | null = null;
  private requestId = 0;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(private readonly baseUrl: string) {}

  private nextId(): number {
    return ++this.requestId;
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    };
    if (this.sessionId) {
      headers['mcp-session-id'] = this.sessionId;
    }
    return headers;
  }

  private async send(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const headers = this.buildHeaders();

    this.logger.debug(
      `→ ${request.method} ${request.params ? JSON.stringify(request.params) : ''}`,
    );

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    const sessionHeader = response.headers.get('mcp-session-id');
    if (sessionHeader && !this.sessionId) {
      this.sessionId = sessionHeader;
      this.logger.debug(`Получен mcp-session-id: ${this.sessionId}`);
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new InternalServerErrorException(
        `MCP HTTP ${response.status}: ${text.slice(0, 500)}`,
      );
    }

    const contentType = response.headers.get('content-type') ?? '';
    const rawBody = await response.text();

    this.logger.debug(`← RAW (${contentType}): ${rawBody.slice(0, 1500)}`);

    if (contentType.includes('text/event-stream')) {
      const parsed = this.parseSse(rawBody);
      if (!parsed) {
        throw new InternalServerErrorException('SSE-ответ не содержит data');
      }
      return parsed;
    }

    try {
      return JSON.parse(rawBody);
    } catch {
      throw new InternalServerErrorException(
        `Не удалось распарсить ответ MCP: ${rawBody.slice(0, 300)}`,
      );
    }
  }

  private parseSse(body: string): JsonRpcResponse | null {
    const lines = body.split(/\r?\n/);
    let lastData: string | null = null;

    for (const line of lines) {
      if (line.startsWith('data:')) {
        lastData = line.slice(5).trim();
      }
    }

    if (!lastData) return null;

    try {
      return JSON.parse(lastData);
    } catch {
      return null;
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const initResponse = await this.send({
        jsonrpc: '2.0',
        id: this.nextId(),
        method: 'initialize',
        params: {
          protocolVersion: '2025-06-18',
          capabilities: {},
          clientInfo: { name: 'ayeda-backend', version: '1.0.0' },
        },
      });

      if (initResponse.error) {
        throw new InternalServerErrorException(
          `initialize error: ${initResponse.error.message}`,
        );
      }

      this.logger.log(
        `MCP initialize OK: ${JSON.stringify(initResponse.result?.serverInfo ?? {})}`,
      );

      const notifyResponse = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'notifications/initialized',
        }),
      });

      if (!notifyResponse.ok && notifyResponse.status !== 202) {
        this.logger.warn(
          `notifications/initialized вернул ${notifyResponse.status}`,
        );
      }

      this.initialized = true;
      this.logger.log('MCP handshake завершён');
    })();

    try {
      await this.initPromise;
    } catch (err) {
      this.initPromise = null;
      this.initialized = false;
      this.sessionId = null;
      throw err;
    }
  }

  async listTools(): Promise<string[]> {
    await this.initialize();
    const res = await this.send({
      jsonrpc: '2.0',
      id: this.nextId(),
      method: 'tools/list',
    });
    if (res.error) {
      throw new InternalServerErrorException(res.error.message);
    }
    return (res.result?.tools ?? []).map((t: any) => t.name);
  }

  async callTool(name: string, args: Record<string, any>): Promise<string> {
    await this.initialize();

    const res = await this.send({
      jsonrpc: '2.0',
      id: this.nextId(),
      method: 'tools/call',
      params: { name, arguments: args },
    });

    if (res.error) {
      throw new InternalServerErrorException(
        `tools/call ${name}: ${res.error.message}`,
      );
    }

    const content = res.result?.content ?? [];
    return content
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text as string)
      .join('\n');
  }
}
