import { http, HttpResponse } from 'msw';
import { FlashcardsCreateCommand, GenerationCreateResponseDto } from '@/types';

// Example flashcard data for mocking
const mockFlashcards = [
  {
    id: '1',
    front: 'What is React?',
    back: 'A JavaScript library for building user interfaces',
    deckId: 'mock-deck-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    front: 'What is Next.js?',
    back: 'A React framework for production-grade applications',
    deckId: 'mock-deck-1',
    createdAt: new Date().toISOString(),
  },
];

// Define your API mocking handlers
export const handlers = [
  // GET flashcards
  http.get('/api/flashcards', () => {
    return HttpResponse.json(mockFlashcards);
  }),

  // POST flashcards
  http.post('/api/flashcards', async ({ request }) => {
    const newFlashcard = (await request.json()) as FlashcardsCreateCommand;
    return HttpResponse.json({
      ...newFlashcard,
      id: `mock-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
  }),

  // Mock your AI generation endpoint
  http.post('/api/generations', async () => {
    return HttpResponse.json({
      generation_id: 123,
      flashcards_proposals: [
        {
          front: 'What is TypeScript?',
          back: 'A strongly typed programming language that builds on JavaScript',
          source: 'ai-full',
        },
        {
          front: 'What is TailwindCSS?',
          back: 'A utility-first CSS framework',
          source: 'ai-full',
        },
      ],
      generated_count: 2,
    } as GenerationCreateResponseDto);
  }),
];
