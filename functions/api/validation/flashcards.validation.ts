import { FlashcardsCreateCommand, Source } from '../../../src/types';

interface ValidationResult {
  success: boolean;
  error?: string;
}

export function validateFlashcardsCommand(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object') {
    return { success: false, error: 'Invalid request data' };
  }

  const command = data as FlashcardsCreateCommand;

  if (!Array.isArray(command.flashcards) || command.flashcards.length === 0) {
    return { success: false, error: 'No flashcards provided' };
  }

  if (typeof command.generation_id !== 'number') {
    return { success: false, error: 'Generation ID required' };
  }

  const validSources: Source[] = ['ai-full', 'ai-edited', 'manual'];

  for (const flashcard of command.flashcards) {
    if (!flashcard.front || typeof flashcard.front !== 'string' || flashcard.front.length > 200) {
      return { success: false, error: 'Invalid front content (max 200 characters)' };
    }

    if (!flashcard.back || typeof flashcard.back !== 'string' || flashcard.back.length > 500) {
      return { success: false, error: 'Invalid back content (max 500 characters)' };
    }

    if (!flashcard.source || !validSources.includes(flashcard.source)) {
      return { success: false, error: 'Invalid source type' };
    }
  }

  return { success: true };
}
