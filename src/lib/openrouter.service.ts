import {
  OpenRouterConfig,
  ChatRequest,
  ChatResponse,
  RetryOptions,
  OpenRouterError,
} from './openrouter.types';

export class OpenRouterService {
  private static instance: OpenRouterService;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly defaultTemperature: number;
  private readonly timeout: number;
  private readonly retryOptions: RetryOptions;

  private constructor(config: OpenRouterConfig) {
    if (!config.apiKey) {
      throw new Error('OpenRouter API key is required!');
    }

    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? 'https://openrouter.ai/api/v1';
    this.defaultModel = config.defaultModel;
    this.defaultTemperature = config.defaultTemperature ?? 0.7;
    this.timeout = config.timeout ?? 30000;
    this.retryOptions = {
      maxAttempts: config.maxRetries ?? 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2,
    };
  }

  public static getInstance(config: OpenRouterConfig): OpenRouterService {
    if (!OpenRouterService.instance) {
      OpenRouterService.instance = new OpenRouterService(config);
    }
    return OpenRouterService.instance;
  }

  public async chatCompletion(request: ChatRequest): Promise<ChatResponse> {
    const payload = this.buildRequestPayload(request);
    const response = await this.executeRequestWithRetry('/chat/completions', payload);
    return this.parseChatResponse(response);
  }

  private buildRequestPayload(request: ChatRequest): Record<string, unknown> {
    return {
      messages: request.messages,
      model: request.model ?? this.defaultModel,
      temperature: request.temperature ?? this.defaultTemperature,
      response_format: request.responseFormat,
    };
  }

  private async executeRequestWithRetry(
    endpoint: string,
    payload: unknown,
    attempt = 1
  ): Promise<Response> {
    try {
      return await this.executeRequest(endpoint, payload);
    } catch (error) {
      if (
        error instanceof OpenRouterError &&
        error.retryable &&
        attempt < this.retryOptions.maxAttempts
      ) {
        const delay = Math.min(
          this.retryOptions.initialDelay * Math.pow(this.retryOptions.backoffFactor, attempt - 1),
          this.retryOptions.maxDelay
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.executeRequestWithRetry(endpoint, payload, attempt + 1);
      }
      throw error;
    }
  }

  private async executeRequest(endpoint: string, payload: unknown): Promise<Response> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return response;
    } catch (error) {
      throw this.handleRequestError(error);
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    const status = response.status;
    const data = await response.json().catch(() => ({}));

    switch (status) {
      case 401:
        throw new OpenRouterError('Authentication failed', 'AUTH_ERROR', status, false);
      case 429:
        throw new OpenRouterError('Rate limit exceeded', 'RATE_LIMIT_ERROR', status, true);
      case 500:
        throw new OpenRouterError('Server error', 'SERVER_ERROR', status, true);
      default:
        throw new OpenRouterError(
          data.error?.message || 'Request failed',
          'API_ERROR',
          status,
          status >= 500
        );
    }
  }

  private async parseChatResponse(response: Response): Promise<ChatResponse> {
    try {
      const data = await response.json();
      return data as ChatResponse;
    } catch (error) {
      throw new OpenRouterError(
        (error as string) || 'Failed to parse response',
        'PARSE_ERROR',
        undefined,
        false
      );
    }
  }

  private handleRequestError(error: unknown): OpenRouterError {
    if (error instanceof OpenRouterError) {
      return error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return new OpenRouterError('Request timed out', 'TIMEOUT_ERROR', undefined, true);
      }
      return new OpenRouterError(error.message, 'NETWORK_ERROR', undefined, true);
    }

    return new OpenRouterError('Unknown error occurred', 'UNKNOWN_ERROR', undefined, false);
  }
}
