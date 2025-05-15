import { FlashcardsCreateCommand } from '../../src/types';
import { validateFlashcardsCommand } from './validation/flashcards.validation';
import { createSupabaseClient } from '../../src/lib/supabase.functions';

interface Env {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
}

const DEFAULT_USER_ID = '6e61325f-0a6f-4404-8e55-f704bde8e5dd';

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const supabase = createSupabaseClient(env);

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
    const flashcardsWithUserId = command.flashcards.map(flashcard => ({
      ...flashcard,
      user_id: DEFAULT_USER_ID
    }));

    const { data, error } = await supabase
      .from('flashcards')
      .insert(flashcardsWithUserId)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return new Response(JSON.stringify({ flashcards: data }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing flashcards creation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: errorMessage 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function onRequest({ request, env }: { request: Request; env: Env }) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  return onRequestPost({ request, env });
}