import { FlashcardProposalDto, FlashcardsCreateCommand } from '../types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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

  const handleSaveFlashcards = async () => {
    if (!generationResponse.is_authenticated) {
      // Możemy pokazać modal/toast informujący o konieczności zalogowania się aby zapisać
      alert('Zaloguj się aby zapisać fiszki');
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No access token available');
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
      alert('Nie udało się zapisać fiszek');
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
        <button onClick={handleSaveFlashcards}>Zapisz fiszki</button>
      )}
    </div>
  );
}
