import { GenerateFlashcardsCommand } from '../../src/types';
import { validateGenerateCommand } from '../../src/app/api/generations/generations.validation';
import { createSupabaseClient } from '../../src/lib/supabase.functions';
import { OpenRouterService } from '../../src/lib/openrouter.service';

interface Env {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  OPENROUTER_API_KEY: string;
}

async function generateMD5Hash(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('MD5', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const supabase = createSupabaseClient(env);
  const openRouter = OpenRouterService.getInstance({
    apiKey: env.OPENROUTER_API_KEY,
    defaultModel: 'openai/gpt-4o-mini',
    defaultTemperature: 0.7,
  });

  try {
    const body = await request.json();
    const validation = validateGenerateCommand(body);

    if (!validation.success) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const command = body as GenerateFlashcardsCommand;
    const sourceTextHash = await generateMD5Hash(command.source_text);
    const startTime = Date.now();

    // Create generation record
    const { data: generation, error: insertError } = await supabase
      .from('generations')
      .insert({
        user_id: 'default', // We'll need to handle auth later
        source_text_hash: sourceTextHash,
        source_text_length: command.source_text.length,
        model: 'openai/gpt-4o-mini',
        generated_count: 0,
        generation_duration: 0,
        accepted_edited_count: 0,
        accepted_unedited_count: 0,
      })
      .select()
      .single();

    if (insertError || !generation) {
      throw new Error(insertError?.message || 'Failed to create generation record');
    }

    // Generate flashcards using AI
    const response = await openRouter.chatCompletion({
      messages: [
        {
          role: 'system',
          content: `You are an expert in creating educational flashcards. Based on the text provided, create a set of fish.
          Ask the question (front) and the answer (back).
          The questions can be clear and allowed.
          Responsibility for being concise but complete.
          
          Source text:
          ${command.source_text}`,
        },
        { role: 'user', content: 'Generate flashcards based on given text.' },
      ],
      responseFormat: {
        type: 'json_schema',
        json_schema: {
          name: 'flashcards',
          strict: true,
          schema: {
            type: 'object',
            required: ['flashcards'],
            additionalProperties: false,
            properties: {
              flashcards: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['front', 'back'],
                  additionalProperties: false,
                  properties: {
                    front: { type: 'string' },
                    back: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error('No response from AI model');
    }

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    let parsedContent: { flashcards: Array<{ front: string; back: string }> };
    try {
      parsedContent = JSON.parse(content);
      if (!parsedContent.flashcards) {
        throw new Error('Unexpected response format from AI model');
      }
    } catch (error) {
      throw new Error('Failed to parse AI response', error instanceof Error ? error : new Error('Unknown error'));
    }

    const proposals = parsedContent.flashcards.map((card) => ({
      front: card.front,
      back: card.back,
      source: 'ai-full' as const,
    }));

    const generationDuration = Date.now() - startTime;

    // Update generation record with results
    await supabase
      .from('generations')
      .update({
        generated_count: proposals.length,
        generation_duration: generationDuration,
      })
      .eq('id', generation.id);

    return new Response(
      JSON.stringify({
        generation_id: generation.id,
        flashcards_proposals: proposals,
        generated_count: proposals.length,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing generation request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error during generation' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function onRequest({ request, env }: { request: Request; env: Env }) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  return onRequestPost({ request, env });
}