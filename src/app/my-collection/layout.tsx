import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Collection | 10x Cards',
  description: 'Your saved flashcards collection',
};

export default function MyCollectionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
