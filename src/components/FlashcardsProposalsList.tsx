import { FlashcardProposalDto, FlashcardsCreateCommand } from '../types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState } from 'react';

interface GenerationResponse {
  generation_id: number | null; // zmienione z string na number | null
  flashcards_proposals: FlashcardProposalDto[]; // używamy właściwego typu
  generated_count: number;
  is_authenticated: boolean;
}

export function FlashcardsProposalsList({
  generationResponse,
}: {
  generationResponse: GenerationResponse;
}) {
  const supabase = createClientComponentClient();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveFlashcards = async () => {
    setIsSaving(true);
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        await supabase.auth.signOut();
        throw new Error('Session expired - please log in again');
      }

      const command: FlashcardsCreateCommand = {
        flashcards: generationResponse.flashcards_proposals.map((fp) => ({
          front: fp.front,
          back: fp.back,
          source: fp.source,
          generation_id: generationResponse.generation_id,
        })),
        generation_id: generationResponse.generation_id!,
      };

      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save flashcards');
      }
    } catch (error) {
      console.error('Error saving flashcards:', error);
      alert(error instanceof Error ? error.message : 'Nie udało się zapisać fiszek');
    } finally {
      setIsSaving(false);
    }
  };

  // Wyświetlamy fiszki niezależnie od tego czy jest generation_id
  return (
    <div>
      {generationResponse.flashcards_proposals.map((flashcard, index) => (
        <div key={index}>
          {/* istniejący kod wyświetlania fiszki */}
          {/* ...existing code... */}
        </div>
      ))}

      {/* Przycisk zapisywania tylko dla zalogowanych */}
      {generationResponse.is_authenticated && (
        <button onClick={handleSaveFlashcards} disabled={isSaving}>
          {isSaving ? 'Zapisuję...' : 'Zapisz fiszki'}
        </button>
      )}
    </div>
  );
}
