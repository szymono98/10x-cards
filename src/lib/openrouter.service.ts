import { OpenRouterConfig, ChatRequest, ChatResponse } from './openrouter.types';

export class OpenRouterService {
  private static instance: OpenRouterService;
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;
  private defaultTemperature: number;
  private timeout: number;

  private constructor(config: OpenRouterConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://openrouter.ai/api/v1';
    this.defaultModel = config.defaultModel;
    this.defaultTemperature = config.defaultTemperature || 0.7;
    this.timeout = config.timeout || 30000;
  }

  public static getInstance(config: OpenRouterConfig): OpenRouterService {
    if (!OpenRouterService.instance) {
      OpenRouterService.instance = new OpenRouterService(config);
    }
    return OpenRouterService.instance;
  }

  private async handleErrorResponse(response: Response): Promise<Error> {
    const errorData = await response.json();
    return new Error(
      `OpenRouter API error: ${response.status} - ${errorData.error || 'Unknown error'}`
    );
  }

  private handleRequestError(error: unknown): Error {
    if (error instanceof Error) {
      return new Error(`OpenRouter request failed: ${error.message}`);
    }
    return new Error('Unknown error during OpenRouter request');
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
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return response;
    } catch (error) {
      throw this.handleRequestError(error);
    }
  }

  public async chatCompletion(request: ChatRequest): Promise<ChatResponse> {
    const payload = {
      model: request.model || this.defaultModel,
      messages: request.messages,
      temperature: request.temperature || this.defaultTemperature,
      response_format: request.responseFormat,
    };

    const response = await this.executeRequest('/chat/completions', payload);
    return response.json();
  }
}
