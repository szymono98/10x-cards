import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useGenerateFlashcards } from '../useGenerateFlashcards';
import { server } from '../../test/mocks/server';
import { http, HttpResponse } from 'msw';
import { act } from 'react';

describe('useGenerateFlashcards', () => {
  it('should generate flashcards successfully', async () => {
    const mockResponse = {
      generation_id: 123,
      flashcards_proposals: [
        {
          front: 'What is TypeScript?',
          back: 'A strongly typed programming language that builds on JavaScript',
          source: 'ai-full'
        },
        {
          front: 'What is TailwindCSS?',
          back: 'A utility-first CSS framework',
          source: 'ai-full'
        },
      ],
      generated_count: 2
    };

    // Set up the MSW handler for this specific test
    server.use(
      http.post('/api/generations', () => {
        return HttpResponse.json(mockResponse);
      })
    );

    // Render the hook
    const { result } = renderHook(() => useGenerateFlashcards());

    // Call the generate function with proper GenerateFlashcardsCommand object
    await act(async () => {
      await result.current.generate({ source_text: 'React and TypeScript basics' });
    });

    // Assert that the loading state is turned off
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle generation errors', async () => {
    // Mock an error response
    server.use(
      http.post('/api/generations', () => {
        return HttpResponse.json(
          { error: 'Failed to generate flashcards' },
          { status: 500 }
        );
      })
    );

    // Render the hook
    const { result } = renderHook(() => useGenerateFlashcards());

    // Call the generate function and expect it to throw
    let error;
    await act(async () => {
      try {
        await result.current.generate({ source_text: 'React and TypeScript basics' });
      } catch (e) {
        error = e;
      }
    });

    // Check if error state is set
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).not.toBeNull();
    expect(error).toBeDefined();
  });
});