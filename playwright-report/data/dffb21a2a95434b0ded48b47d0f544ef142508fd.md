# Test info

- Name: Flashcard Generation >> should generate and save accepted flashcards
- Location: /Users/szymonostrzolek/10x-cards/e2e/generate/flashcard-generation.spec.ts:143:3

# Error details

```
Error: locator.waitFor: Test ended.
Call log:
  - waiting for getByTestId('flashcards-list') to be visible

    at FlashcardGenerationPage.waitForFlashcards (/Users/szymonostrzolek/10x-cards/e2e/page-objects/generate/FlashcardGenerationPage.ts:29:31)
    at FlashcardGenerationPage.generateFlashcards (/Users/szymonostrzolek/10x-cards/e2e/page-objects/generate/FlashcardGenerationPage.ts:73:16)
    at /Users/szymonostrzolek/10x-cards/e2e/generate/flashcard-generation.spec.ts:149:5
```

# Test source

```ts
   1 | import { Page } from '@playwright/test';
   2 | import { FlashcardItem } from './FlashcardItem';
   3 |
   4 | export class FlashcardGenerationPage {
   5 |   constructor(private page: Page) {}
   6 |
   7 |   // Selektory
   8 |   private sourceTextInput = this.page.getByTestId('source-text-input');
   9 |   private generateButton = this.page.getByTestId('generate-button');
  10 |   private flashcardsList = this.page.getByTestId('flashcards-list');
  11 |   private saveAcceptedButton = this.page.getByTestId('save-accepted-button');
  12 |   private saveAllButton = this.page.getByTestId('save-all-button');
  13 |
  14 |   // Helpers
  15 |   private getFlashcardItem(index: number): FlashcardItem {
  16 |     return new FlashcardItem(this.page.getByTestId(`flashcard-item-${index}`));
  17 |   }
  18 |
  19 |   // Akcje
  20 |   async enterSourceText(text: string) {
  21 |     await this.sourceTextInput.fill(text);
  22 |   }
  23 |
  24 |   async clickGenerate() {
  25 |     await this.generateButton.click();
  26 |   }
  27 |
  28 |   async waitForFlashcards() {
> 29 |     await this.flashcardsList.waitFor({ state: 'visible' });
     |                               ^ Error: locator.waitFor: Test ended.
  30 |   }
  31 |
  32 |   async acceptFlashcard(index: number) {
  33 |     await this.getFlashcardItem(index).accept();
  34 |   }
  35 |
  36 |   async rejectFlashcard(index: number) {
  37 |     await this.getFlashcardItem(index).reject();
  38 |   }
  39 |
  40 |   async editFlashcard(index: number, front: string, back: string) {
  41 |     await this.getFlashcardItem(index).edit(front, back);
  42 |   }
  43 |
  44 |   async saveAcceptedFlashcards() {
  45 |     await this.saveAcceptedButton.click();
  46 |   }
  47 |
  48 |   async saveAllFlashcards() {
  49 |     await this.saveAllButton.click();
  50 |   }
  51 |
  52 |   // Asercje
  53 |   async getFlashcardContent(index: number) {
  54 |     return this.getFlashcardItem(index).getText();
  55 |   }
  56 |
  57 |   async isGenerateButtonEnabled() {
  58 |     return !(await this.generateButton.isDisabled());
  59 |   }
  60 |
  61 |   async isSaveAcceptedButtonEnabled() {
  62 |     return !(await this.saveAcceptedButton.isDisabled());
  63 |   }
  64 |
  65 |   async isSaveAllButtonEnabled() {
  66 |     return !(await this.saveAllButton.isDisabled());
  67 |   }
  68 |
  69 |   // Scenariusze złożone
  70 |   async generateFlashcards(text: string) {
  71 |     await this.enterSourceText(text);
  72 |     await this.clickGenerate();
  73 |     await this.waitForFlashcards();
  74 |   }
  75 |
  76 |   async acceptAndSaveFirstNFlashcards(n: number) {
  77 |     for (let i = 0; i < n; i++) {
  78 |       await this.acceptFlashcard(i);
  79 |     }
  80 |     await this.saveAcceptedFlashcards();
  81 |   }
  82 | }
  83 |
```