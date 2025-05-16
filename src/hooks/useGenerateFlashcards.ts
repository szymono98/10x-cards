import { useState, useCallback } from 'react';
import type { GenerateFlashcardsCommand, GenerationCreateResponseDto } from '@/types';

const API_ENDPOINT = '/functions/api/generations';

export function useGenerateFlashcards() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (command: GenerateFlashcardsCommand): Promise<GenerationCreateResponseDto> => {
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
          throw new Error(errorData.error || 'Failed to generate flashcards');
        }

        return await response.json();
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unexpected error occurred';
        setError(errorMessage);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    generate,
    isLoading,
    error,
    setError,
  };
}
