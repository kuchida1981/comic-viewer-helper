import { test, expect } from './fixtures';

test.describe('Navigation', () => {
  test.beforeEach(async ({ comicPage }) => {
    // Ensure UI is fully loaded and visible
    await comicPage.locator('#comic-helper-ui').waitFor({ state: 'visible' });
  });

  test('should scroll to next image when "j" is pressed', async ({ comicPage }) => {
    // Initial scroll position
    const initialY = await comicPage.evaluate(() => window.scrollY);
    
    // Press 'j' to go to next image
    await comicPage.keyboard.press('j');
    
    // Wait for scroll to complete (we expect 100vh scroll)
    await comicPage.waitForFunction((oldY) => Math.abs(window.scrollY - (oldY + window.innerHeight)) < 5, initialY);
    
    const newY = await comicPage.evaluate(() => window.scrollY);
    expect(newY).toBeGreaterThan(initialY);
  });

  test('should scroll back when "k" is pressed', async ({ comicPage }) => {
    // Scroll down first (using 'j' key logic we know works)
    await comicPage.keyboard.press('j');
    await comicPage.waitForFunction(() => window.scrollY >= window.innerHeight - 10);
    
    const scrolledY = await comicPage.evaluate(() => window.scrollY);
    
    // Press 'k' to go back
    await comicPage.keyboard.press('k');
    
    // Wait for scroll back (expecting to return to roughly 0)
    await comicPage.waitForFunction((oldY) => window.scrollY < oldY - 50, scrolledY);
    
    const finalY = await comicPage.evaluate(() => window.scrollY);
    expect(finalY).toBeLessThan(scrolledY);
  });

  test('should navigate when left side of the screen is clicked', async ({ comicPage }) => {
    const initialY = await comicPage.evaluate(() => window.scrollY);
    
    // Click on the first image's left side
    const firstImage = comicPage.locator('.comic-page').first();
    const box = await firstImage.boundingBox();
    if (box) {
        // Click 25% from the left of the image
        await comicPage.mouse.click(box.x + box.width * 0.25, box.y + box.height * 0.5);
    }
    
    // Should go to next page
    await comicPage.waitForFunction((oldY) => window.scrollY > oldY, initialY);
    expect(await comicPage.evaluate(() => window.scrollY)).toBeGreaterThan(initialY);
  });
});
