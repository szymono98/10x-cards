import { FlashcardsCreateCommand } from '../../src/types';
import { validateFlashcardsCommand } from '../../src/app/api/flashcards/flashcards.validation';
import { flashcardsService } from '../../src/app/api/flashcards/flashcards.service';

export async function onRequestPost({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const validation = validateFlashcardsCommand(body);

    if (!validation.success) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const command = body as FlashcardsCreateCommand;
    const result = await flashcardsService.create(command);

    return new Response(JSON.stringify({ flashcards: result }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing flashcards creation:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Handle other HTTP methods
export async function onRequest({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  return onRequestPost({ request });
}