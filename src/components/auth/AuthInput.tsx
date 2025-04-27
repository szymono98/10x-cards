import { Label } from "@/components/ui/label";
import { ErrorNotification } from "@/components/common/ErrorNotification";
import { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

interface AuthInputProps {
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  error?: string;
  registration: UseFormRegisterReturn;
  autoComplete?: string;
}

export function AuthInput({
  id,
  label,
  type = "text",
  error,
  registration,
  autoComplete,
}: AuthInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        type={type}
        {...registration}
        autoComplete={autoComplete}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
          "focus:outline-none focus:ring-1 focus:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-gray-700 dark:border-gray-600 dark:text-white",
          error && "border-red-500 focus:ring-red-500"
        )}
      />
      {error && <ErrorNotification message={error} />}
    </div>
  );
}
