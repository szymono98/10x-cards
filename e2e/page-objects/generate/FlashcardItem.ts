import { Locator } from '@playwright/test';

export class FlashcardItem {
  constructor(private container: Locator) {}

  // Get input fields and text containers
  private get frontInput() {
    return this.container.locator('[data-testid$="-front-input"]');
  }

  private get backInput() {
    return this.container.locator('[data-testid$="-back-input"]');
  }

  private get frontText() {
    return this.container.locator('[data-testid$="-front"]').first();
  }

  private get backText() {
    return this.container.locator('[data-testid$="-back"]').first();
  }

  // Get action buttons
  private get editButton() {
    return this.container.locator('[data-testid$="-edit-button"]');
  }

  private get acceptButton() {
    return this.container.locator('[data-testid$="-accept-button"]');
  }

  private get rejectButton() {
    return this.container.locator('[data-testid$="-reject-button"]');
  }

  // Actions
  async getText() {
    return {
      front: await this.frontText.textContent(),
      back: await this.backText.textContent(),
    };
  }

  async edit(front: string, back: string) {
    await this.editButton.click();
    await this.frontInput.fill(front);
    await this.backInput.fill(back);
    await this.editButton.click();
  }

  async accept() {
    await this.acceptButton.click();
  }

  async reject() {
    await this.rejectButton.click();
  }
}
