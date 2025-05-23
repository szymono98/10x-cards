import { Page } from '@playwright/test';
import { FlashcardItem } from './FlashcardItem';

export class FlashcardGenerationPage {
  constructor(private page: Page) {}

  // Test IDs
  private readonly sourceTextInput = this.page.getByTestId('source-text-input');
  private readonly generateButton = this.page.getByTestId('generate-flashcards-button');
  private readonly flashcardsList = this.page.getByTestId('flashcards-list');
  private readonly saveAcceptedButton = this.page.getByTestId('save-accepted-button');
  private readonly saveAllButton = this.page.getByTestId('save-all-button');

  // Helpers
  private getFlashcardItem(index: number): FlashcardItem {
    return new FlashcardItem(this.page.getByTestId(`flashcard-item-${index}`));
  }

  // Actions
  async enterSourceText(text: string) {
    await this.sourceTextInput.fill(text);
  }

  async clickGenerate() {
    await this.generateButton.click();
  }

  async waitForFlashcards() {
    // First wait for the API response to complete by checking for the first flashcard item
    await this.page.getByTestId('flashcard-item-0').waitFor({ state: 'attached', timeout: 15000 });
    // Then wait for the list container to be visible
    await this.flashcardsList.waitFor({ state: 'visible', timeout: 5000 });
  }

  async acceptFlashcard(index: number) {
    await this.getFlashcardItem(index).accept();
  }

  async rejectFlashcard(index: number) {
    await this.getFlashcardItem(index).reject();
  }

  async editFlashcard(index: number, front: string, back: string) {
    await this.getFlashcardItem(index).edit(front, back);
  }

  async saveAcceptedFlashcards() {
    await this.saveAcceptedButton.click();
  }

  async saveAllFlashcards() {
    await this.saveAllButton.click();
  }

  async waitForSuccessMessage() {
    await this.page.getByText(/Flashcards.*saved successfully/i).waitFor({ state: 'visible', timeout: 10000 });
  }

  // Complete flows
  async generateFlashcards(text: string) {
    await this.enterSourceText(text);
    await this.clickGenerate();
    await this.waitForFlashcards();
  }

  async generateAndSaveFlashcards(text: string, { acceptIndexes = [0, 1] } = {}) {
    await this.generateFlashcards(text);
    
    // Wait for all flashcards to be fully loaded and interactive
    await Promise.all(
      acceptIndexes.map(async (index) => {
        // Wait for the flashcard container to be visible and stable
        await this.page.getByTestId(`flashcard-item-${index}`).waitFor({ 
          state: 'visible', 
          timeout: 10000
        });
      })
    );

    // Accept each flashcard with a small delay between actions
    for (const index of acceptIndexes) {
      await this.acceptFlashcard(index);
      // Add a small delay to ensure UI updates properly
      await this.page.waitForTimeout(100);
    }

    // Wait for save button to be visible and interactive
    await this.saveAcceptedButton.waitFor({ 
      state: 'visible', 
      timeout: 5000 
    });
    
    // Wait until the save button is not disabled
    await this.saveAcceptedButton.evaluate(button => {
      if (button instanceof HTMLButtonElement) {
        return !button.disabled;
      }
      return true;
    });
    
    await this.saveAcceptedFlashcards();
    await this.waitForSuccessMessage();
  }
}
