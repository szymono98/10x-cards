import { FlashcardGenerationView } from '@/components/generate/FlashcardGenerationView';
import { RootLayout } from '@/components/layouts/RootLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generowanie fiszek | 10x Cards',
  description: 'Generuj fiszki za pomocą sztucznej inteligencji',
};

// This ensures the page is static
export function generateStaticParams() {
  return [];
}

export default function GeneratePage() {
  return (
    <RootLayout>
      <FlashcardGenerationView />
    </RootLayout>
  );
}
