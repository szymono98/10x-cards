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

export function CollectionView() {
  const {
    flashcards,
    setFlashcards,
    isLoading,
    error: fetchError,
    setError: setFetchError,
  } = useGetFlashcards();
  const {
    updateFlashcard,
    deleteFlashcard,
    error: editError,
    setError: setEditError,
  } = useEditFlashcard();
  const [success, setSuccess] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleEdit = useCallback(
    async (id: number, front: string, back: string) => {
      setSuccess(null);
      try {
        await updateFlashcard(id, front, back);
        startTransition(() => {
          setSuccess('Flashcard updated successfully');
          setFlashcards((prev) => prev.map((f) => (f.id === id ? { ...f, front, back } : f)));
        });
      } catch (error) {
        console.error('Failed to update flashcard:', error);
      }
    },
    [updateFlashcard, setFlashcards]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      setSuccess(null);
      try {
        await deleteFlashcard(id);
        startTransition(() => {
          setSuccess('Flashcard deleted successfully');
          setFlashcards((prev) => prev.filter((f) => f.id !== id));
        });
      } catch (error) {
        console.error('Failed to delete flashcard:', error);
      }
    },
    [deleteFlashcard, setFlashcards]
  );

  return (
    <RootLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Collection</h1>
        <div className="space-y-6">
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
          ) : flashcards && flashcards.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {flashcards.map((flashcard) => (
                <FlashcardItemView
                  key={flashcard.id}
                  flashcard={flashcard}
                  onSave={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </RootLayout>
  );
}
