import { FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function EmptyState() {
  return (
    <Card className="py-12">
      <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <FileText className="w-12 h-12 mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No flashcards generated yet</h3>
        <p className="text-sm text-center max-w-md">
          Enter your text and click &apos;Generate flashcards&apos; to get started
        </p>
      </div>
    </Card>
  );
}
