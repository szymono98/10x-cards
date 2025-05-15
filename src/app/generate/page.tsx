import { FlashcardGenerationView } from '@/components/generate/FlashcardGenerationView';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Generowanie fiszek | 10x Cards',
  description: 'Generuj fiszki za pomocą sztucznej inteligencji',
};

export const runtime = 'edge';
export const preferredRegion = 'all';
export const dynamic = 'force-dynamic';

// Komponent do wyświetlania podczas ładowania
function LoadingState() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-32 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  );
}

// Komponent do wyświetlania błędów
function ErrorState({ error }: { error: Error }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Wystąpił błąd podczas ładowania strony
            </h3>
            <div className="mt-2 text-sm text-red-700">{error.message}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <ErrorBoundary fallback={ErrorState}>
      <Suspense fallback={<LoadingState />}>
        <FlashcardGenerationView />
      </Suspense>
    </ErrorBoundary>
  );
}
