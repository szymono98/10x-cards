import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Homepage tests', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/10x Cards/);
  });
  
  test('should pass accessibility tests', async ({ page }) => {
    await page.goto('/');
    
    // Run accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    // Check if there are no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});