import { test, expect } from '@playwright/test';
import { FlashcardGenerationPage } from '../page-objects/generate/FlashcardGenerationPage';

test.describe('Flashcard Generation', () => {
  test.use({ storageState: { cookies: [], origins: [{ origin: 'http://localhost:3000', localStorage: [] }] } });
  test.beforeEach(async ({ page }) => {
        await page.route('**/auth/v1/user', (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '4da0d32e-3508-4a8b-a4f9-d8454ddf4a3a',
          email: 'test@example.com',
          app_metadata: {
            provider: 'email'
          },
          user_metadata: {
            name: 'Test User'
          }
        })
      });
    });

    // Mock the current session and log requests
    await page.route('**', async (route) => {
      const request = route.request();
      console.log('Intercepted request:', request.url());

      if (request.url().includes('auth/v1/session')) {
        console.log('Handling auth session request');
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              user: {
                id: '4da0d32e-3508-4a8b-a4f9-d8454ddf4a3a',
                email: 'test@example.com',
                app_metadata: { provider: 'email' },
                user_metadata: { name: 'Test User' }
              },
              session: {
                access_token: 'test-token',
                expires_in: 3600
              }
            },
            error: null
          })
        });
      }
      
      return route.continue();
    });

    // Mock Supabase auth state change event
    await page.route('**/realtime/v1/websocket', (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          event: 'SIGNED_IN',
          session: {
            user: {
              id: '4da0d32e-3508-4a8b-a4f9-d8454ddf4a3a',
              email: 'test@example.com'
            }
          }
        })
      });
    });

    await page.goto('/generate');

    // Mock the generations endpoint
    await page.route('/api/generations', async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        const body = JSON.parse((await request.postData()) || '{}');

        // Validate the source text length
        if (
          !body.source_text ||
          body.source_text.length < 1000 ||
          body.source_text.length > 10000
        ) {
          await route.fulfill({
            status: 400,
            body: JSON.stringify({ error: 'Invalid source text length' }),
          });
          return;
        }

        // Return mock flashcards for valid requests
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
      const request = route.request();
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 201,
          body: JSON.stringify({
            flashcards: [
              {
                id: 1,
                front: 'What is the main purpose of the text?',
                back: 'The text demonstrates character length validation.',
                source: 'ai-full',
                generation_id: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user_id: '4da0d32e-3508-4a8b-a4f9-d8454ddf4a3a'
              }
            ]
          }),
        });
      }
    });

    await page.goto('/generate');
  });

  test('should generate and save accepted flashcards', async ({ page }) => {
    // Arrange
    const flashcardPage = new FlashcardGenerationPage(page);
    const sampleText = 'a'.repeat(1500); // Zapewniamy tekst o długości powyżej 1000 znaków

    // Generate flashcards and wait for the list to appear
    await flashcardPage.generateFlashcards(sampleText);
    await expect(page.getByTestId('flashcards-list')).toBeVisible();

    // Accept first two flashcards
    await flashcardPage.acceptFlashcard(0);
    await flashcardPage.acceptFlashcard(1);

    // Wait for the save button to appear and be enabled
    const saveButton = page.getByTestId('save-accepted-button');
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await expect(saveButton).toBeEnabled({ timeout: 10000 });
    await saveButton.click();

    // Assert
    // Sprawdzenie czy pojawił się komunikat o sukcesie
    await expect(page.getByText('Flashcards are saved successfully')).toBeVisible();

    // Sprawdzenie czy lista fiszek została wyczyszczona po zapisie
    await expect(page.getByTestId('flashcards-list')).not.toBeVisible();

    // Sprawdzenie czy pole tekstowe zostało wyczyszczone
    const sourceTextInput = page.getByTestId('source-text-input');
    await expect(sourceTextInput).toHaveValue('');
  });

  test('should validate text input and button states', async ({ page }) => {
    // Arrange
    const flashcardPage = new FlashcardGenerationPage(page);
    await page.goto('/generate');

    // Act & Assert
    // Początkowo przycisk powinien być wyłączony
    await expect(page.getByTestId('generate-button')).toBeDisabled();

    // Tekst krótszy niż 1000 znaków
    await flashcardPage.enterSourceText('a'.repeat(999));
    await expect(page.getByTestId('generate-button')).toBeDisabled();

    // Tekst dłuższy niż 10000 znaków
    await flashcardPage.enterSourceText('a'.repeat(10001));
    await expect(page.getByTestId('generate-button')).toBeDisabled();

    // Poprawna długość tekstu
    await flashcardPage.enterSourceText('a'.repeat(1500));
    await expect(page.getByTestId('generate-button')).toBeEnabled();
  });

  test('should handle server errors gracefully', async ({ page }) => {
    // Arrange
    const flashcardPage = new FlashcardGenerationPage(page);

    // Override the mock for this specific test
    await page.route('/api/generations', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error during generation' }),
      });
    });

    // Act
    await flashcardPage.enterSourceText('a'.repeat(1500));
    await flashcardPage.clickGenerate();

    // Assert - check for error notification instead of flashcards list
    await expect(page.getByText('Server error during generation')).toBeVisible({
      timeout: 10000,
    });

    // Verify flashcards list is not visible
    await expect(page.getByTestId('flashcards-list')).not.toBeVisible();
  });
});
