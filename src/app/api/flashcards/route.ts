export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { FlashcardsCreateCommand } from '../../../types';
import { validateFlashcardsCommand } from '../validation/flashcards.validation';
import { createSupabaseClient } from '../../../lib/supabase.functions';

export async function GET(request: NextRequest) {
  try {
    // Create supabase client with auth context
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
    supabase.auth.setSession({ access_token: token, refresh_token: '' });

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
    // Create supabase client with auth context
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Missing token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.split(' ')[1];

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

    // Debugowanie sesji
    console.log('Setting up session with token:', {
      tokenLength: token.length,
      urlConfig: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKeyConfig: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });

    // Próba utworzenia sesji z pełną konfiguracją
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: ''
    });

    if (sessionError) {
      console.error('Session setup failed:', sessionError);
      return new Response(JSON.stringify({ 
        error: 'Session initialization failed', 
        details: sessionError.message 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Session setup successful:', {
      hasSession: !!sessionData.session,
      hasUser: !!sessionData.user
    });

    // Próba pobrania użytkownika z utworzonej sesji
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('User error details:', userError);
      return new Response(JSON.stringify({ 
        error: 'Authentication failed', 
        details: userError?.message || 'No user found' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Dodatkowe sprawdzenie czy mamy ID użytkownika
    if (!user.id) {
      console.error('User object:', user);
      return new Response(JSON.stringify({ 
        error: 'Invalid user data', 
        details: 'Missing user ID' 
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
