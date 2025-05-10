import { OpenRouterService } from '@/lib/openrouter.service';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log('API Key check:', {
      isSet: !!apiKey,
      length: apiKey?.length,
      prefix: apiKey?.substring(0, 9),
      suffix: apiKey?.substring(apiKey.length - 4)
    });

    if (!apiKey) {
      return NextResponse.json({ error: 'OPENROUTER_API_KEY not set' }, { status: 500 });
    }

    const openRouter = OpenRouterService.getInstance({
      apiKey,
      defaultModel: 'openai/gpt-4o-mini',
      defaultTemperature: 0.7,
    });

    const response = await openRouter.chatCompletion({
      messages: [
        { role: 'user', content: 'Say "API key is valid"' }
      ],
    });

    return NextResponse.json({ 
      status: 'success',
      message: 'API key is valid',
      response 
    });
  } catch (error) {
    console.error('OpenRouter test failed:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}