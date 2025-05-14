import { RootLayout } from '@/components/layouts/RootLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Collection | 10x Cards',
  description: 'Your saved flashcards collection',
};

export default function MyCollectionPage() {
  return (
    <RootLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Collection</h1>
        {/* Content will be added in future updates */}
      </div>
    </RootLayout>
  );
}
