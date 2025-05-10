import { FlashcardsCreateCommand, FlashcardCreateDto } from '@/types';

export function validateFlashcardsCommand(body: unknown): {
  success: boolean;
  error?: string;
} {
  if (!body || typeof body !== 'object') {
    return { success: false, error: 'Invalid request body' };
  }

  const { flashcards } = body as Partial<FlashcardsCreateCommand>;

  if (!Array.isArray(flashcards) || flashcards.length === 0) {
    return { success: false, error: 'flashcards must be a non-empty array' };
  }

  for (const flashcard of flashcards) {
    const error = validateFlashcard(flashcard);
    if (error) return { success: false, error };
  }

  return { success: true };
}

export function validateFlashcard(flashcard: FlashcardCreateDto): string | null {
  if (!flashcard.front || typeof flashcard.front !== 'string') {
    return 'front is required and must be a string';
  }

  if (!flashcard.back || typeof flashcard.back !== 'string') {
    return 'back is required and must be a string';
  }

  if (!flashcard.source || !['ai-full', 'ai-edited', 'manual'].includes(flashcard.source)) {
    return 'source must be one of: ai-full, ai-edited, manual';
  }

  if (flashcard.front.length > 200) {
    return 'front must not exceed 200 characters';
  }

  if (flashcard.back.length > 500) {
    return 'back must not exceed 500 characters';
  }

  return null;
}
