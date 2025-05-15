import { FlashcardGenerationView } from '@/components/generate/FlashcardGenerationView';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Generowanie fiszek | 10x Cards',
  description: 'Generuj fiszki za pomocą sztucznej inteligencji',
};

export const runtime = 'edge';
export const preferredRegion = 'all';
export const dynamic = 'force-dynamic';

export default function GeneratePage() {
  return (
    <Suspense
      fallback={
        <div className="animate-in fade-in-50 duration-500">
          <div className="container mx-auto px-4 py-8">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6" />
            <div className="space-y-6">
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      }
    >
      <FlashcardGenerationView />
    </Suspense>
  );
}
