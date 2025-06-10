'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

type SupabaseContext = {
  supabase: SupabaseClient;
  user: User | null;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => {
    const client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Override auth methods for testing
    if (typeof window !== 'undefined' && localStorage.getItem('mock-user')) {
      const mockSession = localStorage.getItem('mock-session');
      const parsedSession = mockSession ? JSON.parse(mockSession) : null;

      // Override the auth methods to return mock data
      client.auth.getSession = async () => ({
        data: { session: parsedSession },
        error: null,
      });

      client.auth.getUser = async () => {
        const mockUser = localStorage.getItem('mock-user');
        return {
          data: { user: mockUser ? JSON.parse(mockUser) : null },
          error: null,
        };
      };
    }

    return client;
  });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for mock user in testing environment
    if (typeof window !== 'undefined') {
      const mockUser = localStorage.getItem('mock-user');
      if (mockUser) {
        try {
          const parsedUser = JSON.parse(mockUser);
          setUser(parsedUser);
          return; // Skip real auth setup when using mock
        } catch (error) {
          console.error('Failed to parse mock user:', error);
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return <Context.Provider value={{ supabase, user }}>{children}</Context.Provider>;
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider');
  }
  return context;
};
