import { supabaseClient, ANONYMOUS_USER_ID } from '@/db/supabase.client';
import {
  GenerateFlashcardsCommand,
  GenerationCreateResponseDto,
  FlashcardProposalDto,
} from '@/types';
import { OpenRouterService } from '@/lib/openrouter.service';
import { FlashcardLLMResponse } from '@/lib/openrouter.types';
import MD5 from 'crypto-js/md5';

function generateMD5Hash(message: string): string {
  return MD5(message).toString();
}

class GenerationsService {
  private openRouter: OpenRouterService;

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.startsWith('sk-or-v1-xxxxx')) {
      throw new Error('Valid OPENROUTER_API_KEY is not set in environment variables');
    }

    this.openRouter = OpenRouterService.getInstance({
      apiKey,
      defaultModel: 'openai/gpt-4o-mini',
      defaultTemperature: 0.7,
    });
  }

  private buildSystemPrompt(text: string): string {
    return `You are an expert in creating educational flashcards. Based on the text provided, create a set of fish.
    Ask the question (front) and the answer (back).
    The questions can be clear and allowed.
    Responsibility for being concise but complete.
    
    Source text:
    ${text}`;
  }

  async generate(command: GenerateFlashcardsCommand): Promise<GenerationCreateResponseDto> {
    const sourceTextHash = generateMD5Hash(command.source_text);
    const startTime = Date.now();

    try {
      const { data: generation, error } = await supabaseClient
        .from('generations')
        .insert({
          user_id: ANONYMOUS_USER_ID,
          source_text_hash: sourceTextHash,
          source_text_length: command.source_text.length,
          model: 'openai/gpt-4o-mini',
          generated_count: 0,
          generation_duration: 0,
          accepted_edited_count: 0,
          accepted_unedited_count: 0,
        })
        .select('*')
        .single();

      if (error) throw new Error(`Database error: ${error.message}`);
      if (!generation) throw new Error('No generation record returned after insert');

      const response = await this.openRouter.chatCompletion({
        messages: [
          {
            role: 'system',
            content: this.buildSystemPrompt(command.source_text),
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

      let parsedContent: { flashcards: FlashcardLLMResponse[] };
      try {
        parsedContent = JSON.parse(content);
        if (!parsedContent.flashcards) {
          throw new Error('Unexpected response format from AI model');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', content);
        throw new Error('Failed to parse AI response: ' + (parseError instanceof Error ? parseError.message : String(parseError)));
      }

      const proposals: FlashcardProposalDto[] = parsedContent.flashcards.map((card) => ({
        front: card.front,
        back: card.back,
        source: 'ai-full',
      }));

      const generationDuration = Date.now() - startTime;

      const { error: updateError } = await supabaseClient
        .from('generations')
        .update({
          generated_count: proposals.length,
          generation_duration: generationDuration,
        })
        .eq('id', generation.id);

      if (updateError) {
        console.error('Failed to update generation record:', updateError);
        // Continue despite update error, as we still want to return the generated flashcards
      }

      return {
        generation_id: generation.id,
        flashcards_proposals: proposals,
        generated_count: proposals.length,
      };
    } catch (error) {
      console.error('Generation error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error during generation');
    }
  }
}

export const generationsService = new GenerationsService();
