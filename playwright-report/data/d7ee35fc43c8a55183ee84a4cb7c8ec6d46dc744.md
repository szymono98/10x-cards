# Test info

- Name: Flashcard Generation >> should generate and save accepted flashcards
- Location: /Users/szymonostrzolek/10x-cards/e2e/generate/flashcard-generation.spec.ts:72:3

# Error details

```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for getByTestId('flashcard-0')

    at FlashcardGenerationPage.waitForFlashcards (/Users/szymonostrzolek/10x-cards/e2e/page-objects/generate/FlashcardGenerationPage.ts:30:48)
    at FlashcardGenerationPage.generateFlashcards (/Users/szymonostrzolek/10x-cards/e2e/page-objects/generate/FlashcardGenerationPage.ts:63:16)
    at FlashcardGenerationPage.generateAndSaveFlashcards (/Users/szymonostrzolek/10x-cards/e2e/page-objects/generate/FlashcardGenerationPage.ts:67:5)
    at /Users/szymonostrzolek/10x-cards/e2e/generate/flashcard-generation.spec.ts:76:5
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
    - paragraph: What is the main purpose of the text?
    - paragraph: The text demonstrates character length validation.
    - button:
      - img
    - button:
      - img
    - button:
      - img
    - paragraph: What is the minimum text length required?
    - paragraph: The minimum text length required is 1000 characters.
    - button:
      - img
    - button:
      - img
    - button:
      - img
- button "Open Next.js Dev Tools":
  - img
- alert
```

# Test source

```ts
   1 | import { Page } from '@playwright/test';
   2 | import { FlashcardItem } from './FlashcardItem';
   3 |
   4 | export class FlashcardGenerationPage {
   5 |   constructor(private page: Page) {}
   6 |
   7 |   // Test IDs
   8 |   private readonly sourceTextInput = this.page.getByTestId('source-text-input');
   9 |   private readonly generateButton = this.page.getByTestId('generate-flashcards-button');
  10 |   private readonly flashcardsList = this.page.getByTestId('flashcards-list');
  11 |   private readonly saveAcceptedButton = this.page.getByTestId('save-accepted-button');
  12 |   private readonly saveAllButton = this.page.getByTestId('save-all-button');
  13 |
  14 |   // Helpers
  15 |   private getFlashcardItem(index: number): FlashcardItem {
  16 |     return new FlashcardItem(this.page.getByTestId(`flashcard-${index}`));
  17 |   }
  18 |
  19 |   // Actions
  20 |   async enterSourceText(text: string) {
  21 |     await this.sourceTextInput.fill(text);
  22 |   }
  23 |
  24 |   async clickGenerate() {
  25 |     await this.generateButton.click();
  26 |   }
  27 |
  28 |   async waitForFlashcards() {
  29 |     // First wait for the API response to complete by checking for the first flashcard item
> 30 |     await this.page.getByTestId('flashcard-0').waitFor({ state: 'attached', timeout: 15000 });
     |                                                ^ TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
  31 |     // Then wait for the list container to be visible
  32 |     await this.flashcardsList.waitFor({ state: 'visible', timeout: 5000 });
  33 |   }
  34 |
  35 |   async acceptFlashcard(index: number) {
  36 |     await this.getFlashcardItem(index).accept();
  37 |   }
  38 |
  39 |   async rejectFlashcard(index: number) {
  40 |     await this.getFlashcardItem(index).reject();
  41 |   }
  42 |
  43 |   async editFlashcard(index: number, front: string, back: string) {
  44 |     await this.getFlashcardItem(index).edit(front, back);
  45 |   }
  46 |
  47 |   async saveAcceptedFlashcards() {
  48 |     await this.saveAcceptedButton.click();
  49 |   }
  50 |
  51 |   async saveAllFlashcards() {
  52 |     await this.saveAllButton.click();
  53 |   }
  54 |
  55 |   async waitForSuccessMessage() {
  56 |     await this.page.getByText(/Flashcards.*saved successfully/i).waitFor({ state: 'visible', timeout: 10000 });
  57 |   }
  58 |
  59 |   // Complete flows
  60 |   async generateFlashcards(text: string) {
  61 |     await this.enterSourceText(text);
  62 |     await this.clickGenerate();
  63 |     await this.waitForFlashcards();
  64 |   }
  65 |
  66 |   async generateAndSaveFlashcards(text: string, { acceptIndexes = [0, 1] } = {}) {
  67 |     await this.generateFlashcards(text);
  68 |     
  69 |     // Wait for flashcards to be interactive
  70 |     for (const index of acceptIndexes) {
  71 |       await this.page.getByTestId(`flashcard-${index}`).waitFor({ state: 'attached' });
  72 |       await this.acceptFlashcard(index);
  73 |     }
  74 |
  75 |     // Wait for save button to be enabled
  76 |     await this.saveAcceptedButton.waitFor({ state: 'enabled' });
  77 |     await this.saveAcceptedFlashcards();
  78 |     await this.waitForSuccessMessage();
  79 |   }
  80 | }
  81 |
```