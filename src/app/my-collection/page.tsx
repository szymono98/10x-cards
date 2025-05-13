'use client';

import { RootLayout } from '@/components/layouts/RootLayout';
import { SkeletonLoader } from '@/components/generate/SkeletonLoader';
import { EmptyState } from '@/components/my-collection/EmptyState';
import { useGetFlashcards } from '@/hooks/useGetFlashcards';
import { FlashcardList } from '@/components/generate/FlashcardList';
import { ErrorNotification } from '@/components/common/ErrorNotification';

export default function MyCollectionPage() {
  const { flashcards, isLoading, error } = useGetFlashcards();

  return (
    <RootLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Collection</h1>

        {error && <ErrorNotification message={error} />}

        {isLoading ? (
          <SkeletonLoader />
        ) : flashcards.length > 0 ? (
          <FlashcardList
            proposals={flashcards.map((f) => ({
              ...f,
              source: 'ai-full' as const,
            }))}
            onAccept={() => {}}
            onReject={() => {}}
            onEdit={() => {}}
            data-testid="flashcards-list"
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </RootLayout>
  );
}
