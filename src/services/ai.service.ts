import { FlashcardProposalDto } from "@/types";

export class AIService {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY ?? "";
    this.apiUrl = process.env.OPENROUTER_API_URL ?? "";
  }

  async generateFlashcards(): Promise<FlashcardProposalDto[]> {
    if (!this.apiKey || !this.apiUrl) {
      throw new Error("AI service configuration missing");
    }

    // TODO: Implement actual API call to the AI service
    // TODO: Add retry logic and proper error handling
    // TODO: Transform AI response to FlashcardProposalDto[]

    throw new Error("Not implemented");
  }
}

export const aiService = new AIService();
