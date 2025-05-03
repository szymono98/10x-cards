import { test, expect } from '@playwright/test';
import { FlashcardGenerationPage } from '../page-objects/generate/FlashcardGenerationPage';

test.describe('Flashcard Generation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the generations endpoint
    await page.route('/api/generations', async route => {
      const request = route.request();
      if (request.method() === 'POST') {
        const body = JSON.parse(await request.postData() || '{}');
        
        // Validate the source text length
        if (!body.source_text || body.source_text.length < 1000 || body.source_text.length > 10000) {
          await route.fulfill({ 
            status: 400,
            body: JSON.stringify({ error: 'Invalid source text length' })
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
                front: "What is the main purpose of the text?",
                back: "The text demonstrates character length validation.",
                source: "ai-full"
              },
              {
                front: "What is the minimum text length required?",
                back: "The minimum text length required is 1000 characters.",
                source: "ai-full"
              }
            ],
            generated_count: 2
          })
        });
      }
    });

    await page.goto('/generate');
  });

  test('should generate and save accepted flashcards', async ({ page }) => {
    // Arrange
    const flashcardPage = new FlashcardGenerationPage(page);
    const sampleText = 'a'.repeat(1500); // Zapewniamy tekst o długości powyżej 1000 znaków

    // Act
    await page.goto('/generate');
    
    // Generowanie fiszek
    await flashcardPage.generateFlashcards(sampleText);
    
    // Weryfikacja czy lista fiszek się pojawiła
    await expect(page.getByTestId('flashcards-list')).toBeVisible();

    // Akceptacja pierwszych dwóch fiszek
    await flashcardPage.acceptFlashcard(0);
    await flashcardPage.acceptFlashcard(1);

    // Zapisanie zaakceptowanych fiszek
    await flashcardPage.saveAcceptedFlashcards();

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
    await expect(page.getByTestId('generate-flashcards-button')).toBeDisabled();

    // Tekst krótszy niż 1000 znaków
    await flashcardPage.enterSourceText('a'.repeat(999));
    await expect(page.getByTestId('generate-flashcards-button')).toBeDisabled();

    // Tekst dłuższy niż 10000 znaków
    await flashcardPage.enterSourceText('a'.repeat(10001));
    await expect(page.getByTestId('generate-flashcards-button')).toBeDisabled();

    // Poprawna długość tekstu
    await flashcardPage.enterSourceText('a'.repeat(1500));
    await expect(page.getByTestId('generate-flashcards-button')).toBeEnabled();
  });

  test('should handle server errors gracefully', async ({ page }) => {
    // Arrange
    const flashcardPage = new FlashcardGenerationPage(page);
    await page.goto('/generate');

    // Override the mock for this specific test
    await page.route('/api/generations', async route => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error during generation' })
      });
    });

    // Act
    await flashcardPage.enterSourceText('a'.repeat(1500));
    await flashcardPage.clickGenerate();

    // Assert - check for error notification instead of flashcards list
    await expect(page.getByText('Server error during generation')).toBeVisible({ timeout: 10000 });
    
    // Verify flashcards list is not visible
    await expect(page.getByTestId('flashcards-list')).not.toBeVisible();
  });
});