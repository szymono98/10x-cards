import { test, expect } from '@playwright/test';
import { FlashcardGenerationPage } from '../page-objects/generate/FlashcardGenerationPage';

test.describe('Flashcard Generation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the generations endpoint
    await page.route('/api/generations', async (route) => {
      console.log('Handling /api/generations request');
      const request = route.request();
      if (request.method() === 'POST') {
        const body = await request.postDataJSON();

        // Validate the source text length
        if (
          !body.source_text ||
          body.source_text.length < 1000 ||
          body.source_text.length > 10000
        ) {
          console.log('Invalid text length, returning 400');
          await route.fulfill({
            status: 400,
            body: JSON.stringify({ error: 'Invalid source text length' }),
          });
          return;
        }

        // Simulate API response delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Return mock flashcards for valid requests
        console.log('Returning mock flashcards');
        await route.fulfill({
          status: 201,
          body: JSON.stringify({
            generation_id: 1,
            flashcards_proposals: [
              {
                front: 'What is the main purpose of the text?',
                back: 'The text demonstrates character length validation.',
                source: 'ai-full',
              },
              {
                front: 'What is the minimum text length required?',
                back: 'The minimum text length required is 1000 characters.',
                source: 'ai-full',
              },
            ],
            generated_count: 2,
          }),
        });
      }
    });

    // Mock the flashcards endpoint
    await page.route('/api/flashcards', async (route) => {
      console.log('Handling /api/flashcards request');
      const request = route.request();
      if (request.method() === 'POST') {
        const data = await request.postDataJSON();
        // Simulate API response delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log('Saving flashcards:', data);
        await route.fulfill({
          status: 201,
          body: JSON.stringify({
            flashcards: data.flashcards.map(
              (card: {
                front: string;
                back: string;
                source: 'ai-full' | 'ai-edited';
                generation_id: number;
              }) => ({
                ...card,
                id: 1,
                generation_id: data.generation_id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user_id: '4da0d32e-3508-4a8b-a4f9-d8454ddf4a3a',
              })
            ),
          }),
        });
      }
    });

    await page.goto('/generate');
  });

  test('should generate and save accepted flashcards', async ({ page }) => {
    const flashcardPage = new FlashcardGenerationPage(page);
    const sampleText = 'a'.repeat(1500);

    await flashcardPage.generateAndSaveFlashcards(sampleText);

    // Verify UI is reset
    await expect(page.getByTestId('flashcards-list')).not.toBeVisible();
    await expect(page.getByTestId('source-text-input')).toHaveValue('');
  });

  test('should validate text input and button states', async ({ page }) => {
    const flashcardPage = new FlashcardGenerationPage(page);

    // Initially button should be disabled
    await expect(page.getByTestId('generate-flashcards-button')).toBeDisabled();

    // Test invalid text lengths
    await flashcardPage.enterSourceText('a'.repeat(999));
    await expect(page.getByTestId('generate-flashcards-button')).toBeDisabled();

    await flashcardPage.enterSourceText('a'.repeat(10001));
    await expect(page.getByTestId('generate-flashcards-button')).toBeDisabled();

    // Test valid text length
    await flashcardPage.enterSourceText('a'.repeat(1500));
    await expect(page.getByTestId('generate-flashcards-button')).toBeEnabled();
  });

  test('should handle server errors gracefully', async ({ page }) => {
    const flashcardPage = new FlashcardGenerationPage(page);

    // Override the mock for this specific test
    await page.route('/api/generations', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error during generation' }),
      });
    });

    await flashcardPage.enterSourceText('a'.repeat(1500));
    await flashcardPage.clickGenerate();

    // Verify error handling
    await expect(page.getByText('Server error during generation')).toBeVisible();
    await expect(page.getByTestId('flashcards-list')).not.toBeVisible();

    // Verify UI can still be used
    await expect(page.getByTestId('source-text-input')).toBeEnabled();
    await expect(page.getByTestId('generate-flashcards-button')).toBeEnabled();
  });
});
