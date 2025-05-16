export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { FlashcardsCreateCommand } from '../../../types';
import { validateFlashcardsCommand } from '../validation/flashcards.validation';
import { createSupabaseClient } from '../../../lib/supabase.functions';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Missing token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.split(' ')[1];

    const supabase = createSupabaseClient({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    });

    // Próba pobrania użytkownika bezpośrednio z tokena
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('User retrieval failed:', userError);
      return new Response(JSON.stringify({ 
        error: 'Authentication failed', 
        details: userError?.message || 'No user found' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('No authorization token');
    }

    const token = authHeader.split(' ')[1];
    const supabase = createSupabaseClient({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    });

    // Validate session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session || session.access_token !== token) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user?.id) {
      console.error('User retrieval failed:', userError);
      return new Response(JSON.stringify({ 
        error: 'Authentication failed', 
        details: userError?.message || 'Invalid user data' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: flashcards, error } = await supabase
      .from('flashcards')
      .insert(
        command.flashcards.map((flashcard) => ({
          front: flashcard.front,
          back: flashcard.back,
          user_id: user.id,
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
