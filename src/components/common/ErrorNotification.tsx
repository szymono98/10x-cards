import { XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { memo } from "react";

interface ErrorNotificationProps {
  title?: string;
  message: string;
}

export const ErrorNotification = memo(function ErrorNotification({
  title = "Wystąpił błąd",
  message,
}: ErrorNotificationProps) {
  if (!message) return null;

  return (
    <Alert variant="destructive">
      <XCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
});
