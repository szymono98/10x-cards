import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TextInputAreaProps {
  value: string;
  onChange: (value: string) => void;
}

export function TextInputArea({ value, onChange }: TextInputAreaProps) {
  const charCount = value.length;
  const isValid = charCount >= 1000 && charCount <= 10000;
  const remainingChars = 10000 - charCount;

  return (
    <div className="space-y-2">
      <Label htmlFor="source-text">Tekst źródłowy</Label>
      <Textarea
        id="source-text"
        placeholder="Wklej tekst do przetworzenia (1000-10000 znaków)..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-[200px] ${
          charCount > 0 && !isValid ? "border-red-500" : ""
        }`}
      />
      <div
        className={`text-sm ${
          charCount > 0 && !isValid ? "text-red-500" : "text-gray-500"
        }`}
      >
        {charCount}/10000 znaków{" "}
        {remainingChars >= 0
          ? `(pozostało ${remainingChars})`
          : "(przekroczono limit)"}
      </div>
    </div>
  );
}
