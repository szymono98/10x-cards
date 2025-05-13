import { useState, useEffect } from 'react';
import type { FlashcardDto, FlashcardsListResponseDto } from '@/types';

const API_ENDPOINT = process.env.NODE_ENV === 'production' 
  ? '/functions/api/flashcards'
  : '/api/flashcards';

export function useGetFlashcards() {
  const [flashcards, setFlashcards] = useState<FlashcardDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const response = await fetch(API_ENDPOINT);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch flashcards');
        }

        const data = await response.json() as FlashcardsListResponseDto;
        setFlashcards(data.data);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unexpected error occurred';
        setError(message);
        console.error('Error fetching flashcards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcards();
  }, []);

  return {
    flashcards,
    isLoading,
    error
  };
}