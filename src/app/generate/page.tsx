import { FlashcardGenerationView } from '@/components/generate/FlashcardGenerationView';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Generowanie fiszek | 10x Cards',
  description: 'Generuj fiszki za pomocą sztucznej inteligencji',
};

export const runtime = 'edge';
export const preferredRegion = 'all';
// Explicitly set dynamic to handle auth state
export const dynamic = 'force-dynamic';

export default function GeneratePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FlashcardGenerationView />
    </Suspense>
  );
}
