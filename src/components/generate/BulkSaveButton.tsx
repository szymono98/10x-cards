import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

interface BulkSaveButtonProps {
  onSaveAccepted: () => Promise<void>;
  hasAcceptedFlashcards: boolean;
  isLoading: boolean;
}

export function BulkSaveButton({
  onSaveAccepted,
  hasAcceptedFlashcards,
  isLoading,
}: BulkSaveButtonProps) {
  return (
    <div className="flex justify-end mt-6">
      <Button
        onClick={onSaveAccepted}
        disabled={!hasAcceptedFlashcards || isLoading}
        className="flex items-center"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        {isLoading ? "Zapisywanie..." : "Zapisz zaakceptowane"}
      </Button>
    </div>
  );
}
