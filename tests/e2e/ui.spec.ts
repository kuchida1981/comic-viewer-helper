import { test, expect } from './fixtures';

test.describe('UI Interaction', () => {
  test('should open metadata modal when info button is clicked', async ({ comicPage }) => {
    // Info button is hardcoded as 'Info' in NavigationButtons.ts
    const infoButton = comicPage.locator('.comic-helper-button', { hasText: 'Info' });
    await infoButton.waitFor({ state: 'attached' });
    await infoButton.click({ force: true });

    // Modal should be visible
    const modal = comicPage.locator('.comic-helper-modal-overlay');
    await expect(modal).toBeVisible();

    // Check if title is correct in modal
    const modalTitle = comicPage.locator('.comic-helper-modal-title');
    await expect(modalTitle).toHaveText('Test Comic Title');
  });

          test('should toggle dual view (spread) when checkbox is clicked', async ({ comicPage }) => {

            // Spread control is a label containing a checkbox and text '見開き' or 'Spread'

            const spreadLabel = comicPage.locator('.comic-helper-label', { hasText: /見開き|Spread/ });

            await spreadLabel.waitFor({ state: 'attached' });

        

          

          const checkbox = spreadLabel.locator('input[type="checkbox"]');

          

          // Toggle the checkbox

          await checkbox.click();

          

          // Check if the script state is updated (difficult to check store directly, 

          // but we can check if the offset button appears)

          const adjustBtn = comicPage.locator('.comic-helper-adjust-btn');

          await expect(adjustBtn).toBeVisible();

        });

      
});
