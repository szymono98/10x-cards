import { FlashcardGenerationView } from '@/components/generate/FlashcardGenerationView';
import { RootLayout } from '@/components/layouts/RootLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generowanie fiszek | 10x Cards',
  description: 'Generuj fiszki za pomocą sztucznej inteligencji',
};

// Turn off static optimization for this page
export const dynamic = 'force-dynamic';

export default function GeneratePage() {
  return (
    <RootLayout>
      <FlashcardGenerationView />
    </RootLayout>
  );
}
