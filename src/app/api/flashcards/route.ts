import { NextRequest } from 'next/server';
import { FlashcardsCreateCommand } from '../../../types';
import { validateFlashcardsCommand } from '../validation/flashcards.validation';
import { createSupabaseClient } from '../../../lib/supabase.functions';

const DEFAULT_USER_ID = '6e61325f-0a6f-4404-8e55-f704bde8e5dd';

export async function GET() {
  try {
    const supabase = createSupabaseClient({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    });

    const { data: flashcards, error } = await supabase
      .from('flashcards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return new Response(JSON.stringify(flashcards), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received flashcards request:', body);
    const validation = validateFlashcardsCommand(body);

    if (!validation.success) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const command = body as FlashcardsCreateCommand;

    const supabase = createSupabaseClient({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    });

    const { data: flashcards, error } = await supabase
      .from('flashcards')
      .insert(
        command.flashcards.map((flashcard) => ({
          front: flashcard.front,
          back: flashcard.back,
          user_id: DEFAULT_USER_ID,
          generation_id: command.generation_id,
          source: flashcard.source,
        }))
      )
      .select();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return new Response(JSON.stringify(flashcards), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating flashcards:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
