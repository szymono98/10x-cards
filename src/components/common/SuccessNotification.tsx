import { Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { memo } from 'react';

interface SuccessNotificationProps {
  title?: string;
  message: string;
}

export const SuccessNotification = memo(function SuccessNotification({
  title = 'Success',
  message,
}: SuccessNotificationProps) {
  if (!message) return null;

  return (
    <Alert className="bg-green-50 dark:bg-green-900/10">
      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
      <AlertTitle className="text-green-600 dark:text-green-400">{title}</AlertTitle>
      <AlertDescription className="text-green-700 dark:text-green-300">{message}</AlertDescription>
    </Alert>
  );
});
