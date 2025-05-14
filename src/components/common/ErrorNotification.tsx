import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { memo } from 'react';

interface ErrorNotificationProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
}

export const ErrorNotification = memo(function ErrorNotification({
  title = 'Error',
  message,
  onDismiss,
}: ErrorNotificationProps) {
  if (!message) return null;

  return (
    <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/10 relative p-8">
      <div className="flex items-center justify-between w-full gap-8">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
          <div className="flex items-center gap-2">
            <AlertTitle className="text-red-600 dark:text-red-400">{title}</AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-300">
              {message}
            </AlertDescription>
          </div>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-6 w-6 rounded-full p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
