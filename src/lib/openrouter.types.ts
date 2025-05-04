export interface OpenRouterConfig {
  apiKey: string;
  defaultModel: string;
  baseUrl?: string;
  defaultTemperature?: number;
  timeout?: number;
  maxRetries?: number;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: Message[];
  model?: string;
  temperature?: number;
  responseFormat?: ResponseFormat;
}

export interface ResponseFormat {
  type: 'json_schema';
  json_schema: {
    name: string;
    strict: true;
    schema: Record<string, unknown>;
  };
}

export interface ChatResponse {
  id: string;
  model: string;
  created: number;
  object: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface RetryOptions {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public retryable?: boolean
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

export interface FlashcardLLMResponse {
  front: string;
  back: string;
}
