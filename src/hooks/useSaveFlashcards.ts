import { useState } from 'react';
import type { FlashcardDto, FlashcardsCreateCommand } from '@/types';
import { useSupabase } from '@/lib/providers/supabase-provider';

const API_ENDPOINT = '/api/flashcards';

export function useSaveFlashcards() {
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (command: FlashcardsCreateCommand): Promise<FlashcardDto[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        throw new Error('No access token available - please log in');
      }

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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

  return { save, isLoading, error, setError };
}
