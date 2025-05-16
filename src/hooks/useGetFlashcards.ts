import { useState, useEffect } from 'react';
import type { FlashcardDto, FlashcardsListResponseDto } from '@/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const API_ENDPOINT = '/api/flashcards';

export function useGetFlashcards() {
  const [flashcards, setFlashcards] = useState<FlashcardDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('No access token available');
        }

        const response = await fetch(API_ENDPOINT, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });
        
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
  }, [supabase.auth]);

  const saveFlashcards = async (flashcardsData: Omit<FlashcardDto, 'id'>[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No access token available');
      }

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flashcardsData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save flashcards');
      }

      return await response.json();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save flashcards';
      setError(message);
      throw error;
    }
  };

  return {
    flashcards,
    setFlashcards,
    isLoading,
    error,
    setError,
    saveFlashcards
  };
}