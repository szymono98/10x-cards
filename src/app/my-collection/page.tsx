'use client';

import { RootLayout } from '@/components/layouts/RootLayout';
import { SkeletonLoader } from '@/components/generate/SkeletonLoader';
import { EmptyState } from '@/components/my-collection/EmptyState';
import { useGetFlashcards } from '@/hooks/useGetFlashcards';
import { ErrorNotification } from '@/components/common/ErrorNotification';
import { SuccessNotification } from '@/components/common/SuccessNotification';
import { FlashcardItemView } from '@/components/my-collection/FlashcardItemView';
import { useEditFlashcard } from '@/hooks/useEditFlashcard';
import { useCallback, useState, useTransition } from 'react';

export default function MyCollectionPage() {
  const { flashcards, setFlashcards, isLoading, error: fetchError, setError: setFetchError } = useGetFlashcards();
  const { updateFlashcard, deleteFlashcard, error: editError, setError: setEditError } = useEditFlashcard();
  const [success, setSuccess] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleEdit = useCallback(
    async (id: number, front: string, back: string) => {
      setSuccess(null);

      // Optimistic update
      const previousFlashcards = [...flashcards];
      const flashcardIndex = flashcards.findIndex((f) => f.id === id);

      if (flashcardIndex === -1) return;

      const updatedFlashcard = {
        ...flashcards[flashcardIndex],
        front,
        back,
      };

      startTransition(() => {
        setFlashcards((prev) => [
          ...prev.slice(0, flashcardIndex),
          updatedFlashcard,
          ...prev.slice(flashcardIndex + 1),
        ]);
      });

      try {
        await updateFlashcard(id, front, back);
        setSuccess('Flashcard updated successfully');
      } catch {
        // Revert on error
        startTransition(() => {
          setFlashcards(previousFlashcards);
        });
      }
    },
    [flashcards, updateFlashcard, setFlashcards]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      setSuccess(null);

      // Optimistic delete
      const previousFlashcards = [...flashcards];
      startTransition(() => {
        setFlashcards((prev) => prev.filter((f) => f.id !== id));
      });

      try {
        await deleteFlashcard(id);
        setSuccess('Flashcard deleted successfully');
      } catch {
        // Revert on error
        startTransition(() => {
          setFlashcards(previousFlashcards);
        });
      }
    },
    [flashcards, deleteFlashcard, setFlashcards]
  );

  return (
    <RootLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Collection</h1>

        {(fetchError || editError) && (
          <ErrorNotification 
            message={fetchError || editError || ''} 
            onDismiss={() => {
              if (fetchError) setFetchError(null);
              if (editError) setEditError(null);
            }}
          />
        )}
        {success && <SuccessNotification message={success} onDismiss={() => setSuccess(null)} />}

        {isLoading ? (
          <SkeletonLoader />
        ) : flashcards.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flashcards.map((flashcard) => (
              <FlashcardItemView
                key={flashcard.id}
                flashcard={flashcard}
                onEdit={handleEdit}
                onDelete={handleDelete}
                data-testid={`flashcard-${flashcard.id}`}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </RootLayout>
  );
}
