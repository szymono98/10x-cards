import { useState } from 'react';
import type { FlashcardDto } from '@/types';

const API_ENDPOINT = process.env.NODE_ENV === 'production' 
  ? '/functions/api/flashcards'
  : '/api/flashcards';

export function useEditFlashcard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFlashcard = async (id: number, front: string, back: string): Promise<FlashcardDto> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, front, back }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update flashcard');
      }

      return await response.json();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error occurred';
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFlashcard = async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete flashcard');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error occurred';
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateFlashcard,
    deleteFlashcard,
    isLoading,
    error,
  };
}