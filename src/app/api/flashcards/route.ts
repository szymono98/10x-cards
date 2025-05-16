export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { FlashcardsCreateCommand } from '@/types';

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

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

    const supabase = createSupabaseClient();

    // Get user from token
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
      .eq('user_id', user.id)  // Only return user's own flashcards
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return new Response(JSON.stringify({ data: flashcards }), {
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
    // Check for auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Missing token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.split(' ')[1];
    const supabase = createSupabaseClient();

    // Validate session and get user
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

    // Parse request body
    const body = await request.json();
    const command = body as FlashcardsCreateCommand;

    // Validate flashcards data
    if (!Array.isArray(command.flashcards) || command.flashcards.length === 0) {
      return new Response(JSON.stringify({ error: 'No flashcards provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Require generation_id
    if (!command.generation_id) {
      return new Response(JSON.stringify({ error: 'Generation ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Insert flashcards with user ID
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
