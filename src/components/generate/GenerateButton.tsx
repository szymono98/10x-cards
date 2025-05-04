import { Button } from '@/components/ui/button';
import { Loader2, Wand2 } from 'lucide-react';

interface GenerateButtonProps {
  onClick: () => Promise<void>;
  disabled: boolean;
  isLoading: boolean;
}

export function GenerateButton({ onClick, disabled, isLoading }: GenerateButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size="lg"
      className="w-full font-medium shadow hover:shadow-indigo-500/20 transition-all"
      data-testid="generate-flashcards-button"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" />
          Generate flashcards
        </>
      )}
    </Button>
  );
}
