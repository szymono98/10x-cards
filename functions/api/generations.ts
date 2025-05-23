export const runtime = 'edge';

import { GenerateFlashcardsCommand } from '../../src/types';
import { validateGenerateCommand } from './validation/generations.validation';
import { createSupabaseClient } from '../../src/lib/supabase.functions';
import { OpenRouterService } from '../../src/lib/openrouter.service';

interface Env {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  OPENROUTER_API_KEY: string;
}

const DEFAULT_USER_ID = '6e61325f-0a6f-4404-8e55-f704bde8e5dd';

async function generateMD5Hash(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('MD5', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    // Validate environment variables
    if (!env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
    }
    if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    if (!env.OPENROUTER_API_KEY) {
      throw new Error('Missing OPENROUTER_API_KEY');
    }

    const supabase = createSupabaseClient(env);
    const openRouter = OpenRouterService.getInstance({
      apiKey: env.OPENROUTER_API_KEY,
      defaultModel: 'openai/gpt-4o-mini',
      defaultTemperature: 0.7,
    });

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

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
    try {
      const { data: generation, error: insertError } = await supabase
        .from('generations')
        .insert({
          user_id: DEFAULT_USER_ID, // Using the correct default user ID that matches RLS policies
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

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        throw new Error(`Database error: ${insertError.message}`);
      }
      if (!generation) {
        throw new Error('No generation record returned after insert');
      }

      // Generate flashcards using AI
      let response;
      try {
        console.log('Sending request to OpenRouter API with config:', {
          model: 'openai/gpt-4o-mini',
          temperature: 0.7,
          textLength: command.source_text.length,
          apiKeyPresent: !!env.OPENROUTER_API_KEY,
        });

        response = await openRouter.chatCompletion({
          messages: [
            {
              role: 'system',
              content: `You are an expert in creating educational flashcards. You will receive a text and your task is to create flashcards from it.
              For each important concept in the text, create a question (front) and answer (back).
              Make questions clear, concise but comprehensive.
              Make answers complete but not too verbose.
              Don't use the exact text from the source - rephrase in your own words.
              Generate 3-5 high-quality flashcards.
              
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
      } catch (error) {
        console.error('OpenRouter API error:', {
          error,
          request: {
            model: 'openai/gpt-4o-mini',
            temperature: 0.7,
            textLength: command.source_text.length
          }
        });
        
        let errorMessage = 'Failed to generate flashcards with AI';
        if (error instanceof Error) {
          errorMessage += `: ${error.message}`;
        }
        
        throw new Error(errorMessage);
      }

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
        console.error('Failed to parse AI response:', content);
        throw new Error('Failed to parse AI response', error as Error);
      }

      const proposals = parsedContent.flashcards.map((card) => ({
        front: card.front,
        back: card.back,
        source: 'ai-full' as const,
      }));

      const generationDuration = Date.now() - startTime;

      // Update generation record with results
      try {
        const { error: updateError } = await supabase
          .from('generations')
          .update({
            generated_count: proposals.length,
            generation_duration: generationDuration,
          })
          .eq('id', generation.id);

        if (updateError) {
          console.error('Failed to update generation record:', updateError);
        }
      } catch (error) {
        console.error('Error updating generation record:', error);
      }

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
      console.error('Database operation error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error processing generation request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error during generation',
        details: errorMessage 
      }), 
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