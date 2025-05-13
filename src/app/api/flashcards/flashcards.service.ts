import { supabaseClient } from '@/db/supabase.client';
import { FlashcardsCreateCommand, FlashcardDto } from '@/types';

// Default user ID for development/testing purposes
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

class FlashcardsService {
  async getAll(): Promise<FlashcardDto[]> {
    const { data, error } = await supabaseClient
      .from('flashcards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch flashcards:', error);
      throw new Error(error.message);
    }

    return data;
  }

  async create(command: FlashcardsCreateCommand): Promise<FlashcardDto[]> {
    const flashcardsWithUserId = command.flashcards.map(flashcard => ({
      ...flashcard,
      user_id: DEFAULT_USER_ID
    }));

    const { data, error } = await supabaseClient
      .from('flashcards')
      .insert(flashcardsWithUserId)
      .select();

    if (error) {
      console.error('Failed to create flashcards:', error);
      throw new Error(error.message);
    }

    return data;
  }
}

export const flashcardsService = new FlashcardsService();
