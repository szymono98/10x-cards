import { z } from 'zod';
import { FlashcardCreateDto } from '@/types';

export const flashcardSchema = z.object({
  front: z.string().min(1).max(200),
  back: z.string().min(1).max(500),
  source: z.enum(['ai-full', 'ai-edited', 'manual']),
  generation_id: z.number().optional()
});

export const createFlashcardsSchema = z.object({
  flashcards: z.array(flashcardSchema).min(1)
});

export function validateFlashcardsCommand(body: unknown) {
  return createFlashcardsSchema.safeParse(body);
}

// Keep the existing validation function for backward compatibility if needed
export function validateFlashcard(flashcard: FlashcardCreateDto): string | null {
  const result = flashcardSchema.safeParse(flashcard);
  if (!result.success) {
    return result.error.errors[0]?.message || 'Invalid flashcard data';
  }
  return null;
}
