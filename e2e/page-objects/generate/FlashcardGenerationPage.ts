import { Page } from '@playwright/test';
import { FlashcardItem } from './FlashcardItem';

export class FlashcardGenerationPage {
  constructor(private page: Page) {}

  // Selektory
  private sourceTextInput = this.page.getByTestId('source-text-input');
  private generateButton = this.page.getByTestId('generate-button');
  private flashcardsList = this.page.getByTestId('flashcards-list');
  private saveAcceptedButton = this.page.getByTestId('save-accepted-button');
  private saveAllButton = this.page.getByTestId('save-all-button');

  // Helpers
  private getFlashcardItem(index: number): FlashcardItem {
    return new FlashcardItem(this.page.getByTestId(`flashcard-item-${index}`));
  }

  // Akcje
  async enterSourceText(text: string) {
    await this.sourceTextInput.fill(text);
  }

  async clickGenerate() {
    await this.generateButton.click();
  }

  async waitForFlashcards() {
    await this.flashcardsList.waitFor({ state: 'visible' });
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

  // Asercje
  async getFlashcardContent(index: number) {
    return this.getFlashcardItem(index).getText();
  }

  async isGenerateButtonEnabled() {
    return !(await this.generateButton.isDisabled());
  }

  async isSaveAcceptedButtonEnabled() {
    return !(await this.saveAcceptedButton.isDisabled());
  }

  async isSaveAllButtonEnabled() {
    return !(await this.saveAllButton.isDisabled());
  }

  // Scenariusze złożone
  async generateFlashcards(text: string) {
    await this.enterSourceText(text);
    await this.clickGenerate();
    await this.waitForFlashcards();
  }

  async acceptAndSaveFirstNFlashcards(n: number) {
    for (let i = 0; i < n; i++) {
      await this.acceptFlashcard(i);
    }
    await this.saveAcceptedFlashcards();
  }
}
