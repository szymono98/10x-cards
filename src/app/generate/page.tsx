import { FlashcardGenerationView } from '@/components/generate/FlashcardGenerationView';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { GenerateErrorState } from '@/components/generate/GenerateErrorState';
import { GenerateLoadingState } from '@/components/generate/GenerateLoadingState';

export const metadata: Metadata = {
  title: 'Generowanie fiszek | 10x Cards',
  description: 'Generuj fiszki za pomocą sztucznej inteligencji',
};

export const runtime = 'edge';
export const preferredRegion = 'all';
export const dynamic = 'force-dynamic';

export default function GeneratePage() {
  return (
    <ErrorBoundary fallback={GenerateErrorState}>
      <Suspense fallback={<GenerateLoadingState />}>
        <FlashcardGenerationView />
      </Suspense>
    </ErrorBoundary>
  );
}
