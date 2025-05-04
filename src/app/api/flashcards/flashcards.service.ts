import { supabaseClient } from '@/db/supabase.client';
import { FlashcardsCreateCommand, FlashcardDto } from '@/types';

class FlashcardsService {
  async create(command: FlashcardsCreateCommand): Promise<FlashcardDto[]> {
    const { data, error } = await supabaseClient
      .from('flashcards')
      .insert(command.flashcards)
      .select();

    if (error) {
      console.error('Failed to create flashcards:', error);
      throw new Error(error.message);
    }

    return data;
  }
}

export const flashcardsService = new FlashcardsService();
