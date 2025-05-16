export interface FlashcardDto {
  id: string;
  front: string;
  back: string;
  user_id: string;
  generation_id: string | null;
  source: string;
}

export interface FlashcardsListResponseDto {
  data: FlashcardDto[];
}

export interface FlashcardsCreateCommand {
  flashcards: Omit<FlashcardDto, 'id'>[];
  generation_id: string | null;
}

export interface GenerateFlashcardsCommand {
  source_text: string;
}

export interface GenerationResponse {
  generation_id: string | null;
  flashcards_proposals: FlashcardProposal[];
  generated_count: number;
  is_authenticated: boolean;
}

export interface FlashcardProposal {
  front: string;
  back: string;
  source: 'ai-full' | 'ai-brief' | 'user';
}