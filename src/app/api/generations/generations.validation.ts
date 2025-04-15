import { GenerateFlashcardsCommand } from "@/types";

export function validateGenerateCommand(body: unknown): { success: boolean; error?: string } {
  if (!body || typeof body !== "object") {
    return { success: false, error: "Invalid request body" };
  }

  const { source_text } = body as Partial<GenerateFlashcardsCommand>;

  if (!source_text) {
    return { success: false, error: "source_text is required" };
  }

  if (typeof source_text !== "string") {
    return { success: false, error: "source_text must be a string" };
  }

  if (source_text.length < 1000 || source_text.length > 10000) {
    return {
      success: false,
      error: "source_text must be between 1000 and 10000 characters"
    };
  }

  return { success: true };
}
