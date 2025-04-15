import { createHash } from 'crypto';
import { supabaseClient, DEFAULT_USER_ID } from "@/db/supabase.client";
import { GenerateFlashcardsCommand, GenerationCreateResponseDto, FlashcardProposalDto } from "@/types";

class GenerationsService {
  async generate(command: GenerateFlashcardsCommand): Promise<GenerationCreateResponseDto> {
    const sourceTextHash = createHash('md5').update(command.source_text).digest('hex');
    const startTime = Date.now();

    // Log the request details
    console.log('Attempting to create generation with:', {
      user_id: DEFAULT_USER_ID,
      source_text_hash: sourceTextHash,
      source_text_length: command.source_text.length
    });

    try {
      // Try to insert with minimal required fields first
      const { data: generation, error } = await supabaseClient
        .from('generations')
        .insert({
          user_id: DEFAULT_USER_ID,
          source_text_hash: sourceTextHash,
          source_text_length: command.source_text.length,
          model: 'mock-gpt-4',
          generated_count: 0,
          generation_duration: 0,
          accepted_edited_count: 0,
          accepted_unedited_count: 0
        })
        .select('*')
        .single();

      if (error) {
        // Log detailed error information
        console.error('Detailed Supabase error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Database error: ${error.message}`);
      }

      if (!generation) {
        throw new Error('No generation record returned after insert');
      }

      // Mock AI service response with Polish content
      const proposals: FlashcardProposalDto[] = [
        {
          front: "Jaką rolę odgrywa technologia w dzisiejszych czasach?",
          back: "Technologia odgrywa kluczową rolę w codziennym życiu, stając się nieodłącznym elementem pracy, nauki i rozrywki.",
          source: "ai-full"
        },
        {
          front: "Jakie są główne wyzwania związane z rozwojem technologii?",
          back: "Główne wyzwania to bezpieczeństwo danych i ochrona prywatności użytkowników.",
          source: "ai-full"
        }
      ];

      const generationDuration = Date.now() - startTime;

      // Update generation with results
      const { error: updateError } = await supabaseClient
        .from('generations')
        .update({ 
          generated_count: proposals.length,
          generation_duration: generationDuration
        })
        .eq('id', generation.id);

      if (updateError) {
        console.error('Failed to update generation:', updateError);
      }

      console.log('Successfully created generation:', {
        id: generation.id,
        proposals_count: proposals.length
      });

      return {
        generation_id: generation.id,
        flashcards_proposals: proposals,
        generated_count: proposals.length
      };

    } catch (error) {
      console.error('Generation service error:', error);
      throw error;
    }
  }

  private async logGenerationError(generationId: number, error: any) {
    const errorResult = await supabaseClient
      .from('generation_error_logs')
      .insert({
        generation_id: generationId,
        user_id: DEFAULT_USER_ID,
        error_message: error.message,
        error_code: error.code || 'UNKNOWN',
        model: 'mock-gpt-4',
        source_text_hash: '',
        created_at: new Date().toISOString(), // Add created_at explicitly
        source_text_length: 0
      });

    if (errorResult.error) {
      console.error('Failed to log error:', errorResult.error);
    }

    await supabaseClient
      .from('generations')
      .update({ 
        generated_count: 0,
        generation_duration: 0
      })
      .eq('id', generationId);
  }
}

export const generationsService = new GenerationsService();
