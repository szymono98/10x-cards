import { useState } from 'react';
import type { FlashcardsCreateCommand, FlashcardDto } from '@/types';

const API_ENDPOINT = process.env.NODE_ENV === 'production' 
  ? '/functions/api/flashcards'
  : '/api/flashcards';

export function useSaveFlashcards() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (command: FlashcardsCreateCommand): Promise<FlashcardDto[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save flashcards');
      }

      const data = await response.json();
      return data.flashcards;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error occurred';
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { save, isLoading, error };
}
