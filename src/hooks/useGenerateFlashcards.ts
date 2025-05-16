import { useState, useCallback } from 'react';
import type { GenerateFlashcardsCommand, GenerationCreateResponseDto } from '@/types';

const API_ENDPOINT = '/api/generations';

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

        const data = await response.json();

        if (!response.ok) {
          const message = data?.error || `HTTP error! status: ${response.status}`;
          throw new Error(message);
        }

        return data;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        setError(message);
        throw error;
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
