import { GenerateFlashcardsCommand } from '../../../src/types';

interface ValidationResult {
  success: boolean;
  error?: string;
}

export function validateGenerateCommand(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object') {
    return { success: false, error: 'Invalid request data' };
  }

  const command = data as GenerateFlashcardsCommand;

  if (!command.source_text || typeof command.source_text !== 'string') {
    return { success: false, error: 'Source text is required' };
  }

  if (command.source_text.length < 1000 || command.source_text.length > 10000) {
    return { success: false, error: 'Source text must be between 1000 and 10000 characters' };
  }

  return { success: true };
}
