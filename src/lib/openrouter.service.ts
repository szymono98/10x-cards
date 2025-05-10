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

    // Log configuration (without exposing full API key)
    console.log('OpenRouter Service Configuration:', {
      baseUrl: this.baseUrl,
      model: this.defaultModel,
      keyFormat: this.apiKey ? `${this.apiKey.slice(0, 10)}...${this.apiKey.slice(-4)}` : 'not set'
    });
  }

  public static getInstance(config: OpenRouterConfig): OpenRouterService {
    if (!OpenRouterService.instance) {
      OpenRouterService.instance = new OpenRouterService(config);
    }
    return OpenRouterService.instance;
  }

  private async handleErrorResponse(response: Response): Promise<Error> {
    let errorMessage = `OpenRouter API error: ${response.status}`;
    try {
      const errorData = await response.json();
      console.error('OpenRouter API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        error: errorData
      });
      if (errorData.error) {
        errorMessage += ` - ${JSON.stringify(errorData.error)}`;
      }
    } catch {
      // If response is not JSON, try to get text
      try {
        const textError = await response.text();
        errorMessage += ` - ${textError}`;
      } catch {
        errorMessage += ' - Could not parse error response';
      }
    }
    return new Error(errorMessage);
  }

  private handleRequestError(error: unknown): Error {
    console.error('OpenRouter Request Error:', error);
    if (error instanceof Error) {
      return new Error(`OpenRouter request failed: ${error.message}`);
    }
    return new Error('Unknown error during OpenRouter request');
  }

  private async executeRequest(endpoint: string, payload: unknown): Promise<Response> {
    try {
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/ostrzolekpawel/10x-cards',
        'X-Title': '10x-cards',
        'OpenAI-Organization': 'ostrzolekpawel-10x-cards'
      };

      console.log('Making OpenRouter request:', {
        url: `${this.baseUrl}${endpoint}`,
        headers: Object.keys(headers),
        payloadSize: JSON.stringify(payload).length,
        apiKeyPresent: !!this.apiKey,
        apiKeyFormat: this.apiKey ? `${this.apiKey.slice(0, 10)}...` : 'not set'
      });

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
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
