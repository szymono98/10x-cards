import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { useSupabase } from '@/lib/providers/supabase-provider';

interface BulkSaveButtonProps {
  onSaveAccepted: () => Promise<void>;
  hasAcceptedFlashcards: boolean;
  isLoading: boolean;
  label?: string;
}

export function BulkSaveButton({
  onSaveAccepted,
  hasAcceptedFlashcards,
  isLoading,
  label = 'Save accepted',
}: BulkSaveButtonProps) {
  const { user } = useSupabase();

  if (!user) return null;

  return (
    <div className="flex justify-end mt-6">
      <Button
        onClick={onSaveAccepted}
        disabled={!hasAcceptedFlashcards || isLoading}
        className="flex items-center"
        data-testid={label === 'Save accepted' ? 'save-accepted-button' : 'save-all-button'}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        {isLoading ? 'Saving...' : label}
      </Button>
    </div>
  );
}
