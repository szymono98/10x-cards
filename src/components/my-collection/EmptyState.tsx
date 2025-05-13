import { Library } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function EmptyState() {
  return (
    <Card className="py-12">
      <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <Library className="w-12 h-12 mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No flashcards saved yet</h3>
        <p className="text-sm text-center max-w-md mb-6">
          Generate and save some flashcards to start building your collection
        </p>
        <Button asChild>
          <Link href="/generate">Generate Flashcards</Link>
        </Button>
      </div>
    </Card>
  );
}
