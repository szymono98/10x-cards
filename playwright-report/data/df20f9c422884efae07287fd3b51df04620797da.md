# Test info

- Name: Flashcard Generation >> should handle server errors gracefully
- Location: /Users/szymonostrzolek/10x-cards/e2e/generate/flashcard-generation.spec.ts:196:3

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toBeVisible()

Locator: getByText('Server error during generation')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 10000ms
  - waiting for getByText('Server error during generation')

    at /Users/szymonostrzolek/10x-cards/e2e/generate/flashcard-generation.spec.ts:213:68
```

# Page snapshot

```yaml
- banner:
  - link "10x Cards":
    - /url: /
  - navigation:
    - link "Sign in":
      - /url: /auth/login
    - link "Sign up":
      - /url: /auth/register
- main:
  - main:
    - heading "Flashcards generate" [level=1]
    - text: Source text
    - textbox "Source text": aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    - text: 1500/10000 characters (8500 remaining)
    - button "Generate flashcards":
      - img
      - text: Generate flashcards
    - alert:
      - img
      - text: Error Unexpected token '<', "<!DOCTYPE "... is not valid JSON
      - button "Dismiss":
        - img
        - text: Dismiss
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 1 Issue
- button "Collapse issues badge":
  - img
- alert
```

# Test source

```ts
  113 |       }
  114 |     });
  115 |
  116 |     // Mock the flashcards endpoint
  117 |     await page.route('/api/flashcards', async (route) => {
  118 |       const request = route.request();
  119 |       if (request.method() === 'POST') {
  120 |         await route.fulfill({
  121 |           status: 201,
  122 |           body: JSON.stringify({
  123 |             flashcards: [
  124 |               {
  125 |                 id: 1,
  126 |                 front: 'What is the main purpose of the text?',
  127 |                 back: 'The text demonstrates character length validation.',
  128 |                 source: 'ai-full',
  129 |                 generation_id: 1,
  130 |                 created_at: new Date().toISOString(),
  131 |                 updated_at: new Date().toISOString(),
  132 |                 user_id: '4da0d32e-3508-4a8b-a4f9-d8454ddf4a3a'
  133 |               }
  134 |             ]
  135 |           }),
  136 |         });
  137 |       }
  138 |     });
  139 |
  140 |     await page.goto('/generate');
  141 |   });
  142 |
  143 |   test('should generate and save accepted flashcards', async ({ page }) => {
  144 |     // Arrange
  145 |     const flashcardPage = new FlashcardGenerationPage(page);
  146 |     const sampleText = 'a'.repeat(1500); // Zapewniamy tekst o długości powyżej 1000 znaków
  147 |
  148 |     // Generate flashcards and wait for the list to appear
  149 |     await flashcardPage.generateFlashcards(sampleText);
  150 |     await expect(page.getByTestId('flashcards-list')).toBeVisible();
  151 |
  152 |     // Accept first two flashcards
  153 |     await flashcardPage.acceptFlashcard(0);
  154 |     await flashcardPage.acceptFlashcard(1);
  155 |
  156 |     // Wait for the save button to appear and be enabled
  157 |     const saveButton = page.getByTestId('save-accepted-button');
  158 |     await expect(saveButton).toBeVisible({ timeout: 10000 });
  159 |     await expect(saveButton).toBeEnabled({ timeout: 10000 });
  160 |     await saveButton.click();
  161 |
  162 |     // Assert
  163 |     // Sprawdzenie czy pojawił się komunikat o sukcesie
  164 |     await expect(page.getByText('Flashcards are saved successfully')).toBeVisible();
  165 |
  166 |     // Sprawdzenie czy lista fiszek została wyczyszczona po zapisie
  167 |     await expect(page.getByTestId('flashcards-list')).not.toBeVisible();
  168 |
  169 |     // Sprawdzenie czy pole tekstowe zostało wyczyszczone
  170 |     const sourceTextInput = page.getByTestId('source-text-input');
  171 |     await expect(sourceTextInput).toHaveValue('');
  172 |   });
  173 |
  174 |   test('should validate text input and button states', async ({ page }) => {
  175 |     // Arrange
  176 |     const flashcardPage = new FlashcardGenerationPage(page);
  177 |     await page.goto('/generate');
  178 |
  179 |     // Act & Assert
  180 |     // Początkowo przycisk powinien być wyłączony
  181 |     await expect(page.getByTestId('generate-button')).toBeDisabled();
  182 |
  183 |     // Tekst krótszy niż 1000 znaków
  184 |     await flashcardPage.enterSourceText('a'.repeat(999));
  185 |     await expect(page.getByTestId('generate-button')).toBeDisabled();
  186 |
  187 |     // Tekst dłuższy niż 10000 znaków
  188 |     await flashcardPage.enterSourceText('a'.repeat(10001));
  189 |     await expect(page.getByTestId('generate-button')).toBeDisabled();
  190 |
  191 |     // Poprawna długość tekstu
  192 |     await flashcardPage.enterSourceText('a'.repeat(1500));
  193 |     await expect(page.getByTestId('generate-button')).toBeEnabled();
  194 |   });
  195 |
  196 |   test('should handle server errors gracefully', async ({ page }) => {
  197 |     // Arrange
  198 |     const flashcardPage = new FlashcardGenerationPage(page);
  199 |
  200 |     // Override the mock for this specific test
  201 |     await page.route('/api/generations', async (route) => {
  202 |       await route.fulfill({
  203 |         status: 500,
  204 |         body: JSON.stringify({ error: 'Server error during generation' }),
  205 |       });
  206 |     });
  207 |
  208 |     // Act
  209 |     await flashcardPage.enterSourceText('a'.repeat(1500));
  210 |     await flashcardPage.clickGenerate();
  211 |
  212 |     // Assert - check for error notification instead of flashcards list
> 213 |     await expect(page.getByText('Server error during generation')).toBeVisible({
      |                                                                    ^ Error: Timed out 10000ms waiting for expect(locator).toBeVisible()
  214 |       timeout: 10000,
  215 |     });
  216 |
  217 |     // Verify flashcards list is not visible
  218 |     await expect(page.getByTestId('flashcards-list')).not.toBeVisible();
  219 |   });
  220 | });
  221 |
```