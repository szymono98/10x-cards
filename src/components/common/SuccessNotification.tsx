import { Check, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { memo } from 'react';

interface SuccessNotificationProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
}

export const SuccessNotification = memo(function SuccessNotification({
  title = 'Success',
  message,
  onDismiss,
}: SuccessNotificationProps) {
  if (!message) return null;

  return (
    <Alert className="bg-green-50 dark:bg-green-900/10 relative mb-4">
      <div className="flex items-center justify-between w-full gap-8">
        <div className="flex items-center gap-2">
          <Check className="h-8 w-8 flex-shrink-0 text-green-600 dark:text-green-400" />
          <div className="flex items-center gap-2">
            <AlertTitle className="text-green-600 dark:text-green-400">{title}</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              {message}
            </AlertDescription>
          </div>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-6 w-6 rounded-full p-0 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </div>
    </Alert>
  );
});
