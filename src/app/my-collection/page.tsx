import { Metadata } from 'next';
import { CollectionView } from '@/components/my-collection/CollectionView';

export const metadata: Metadata = {
  title: 'My Collection | 10x Cards',
  description: 'View and manage your flashcard collection',
};

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default function MyCollectionPage() {
  return <CollectionView />;
}
