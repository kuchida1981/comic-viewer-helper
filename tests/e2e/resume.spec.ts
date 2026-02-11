import { test, expect } from './fixtures';

test.describe('Resume Position', () => {
  test('should show resume notification after reload and jump to position', async ({ comicPage }) => {
    // 1. Scroll to the 3rd image (index 2, which should be at 200vh)
    await comicPage.keyboard.press('j');
    await comicPage.waitForTimeout(500); // Wait for scroll animation
    await comicPage.keyboard.press('j');
    await comicPage.waitForTimeout(500);
    
    const scrolledY = await comicPage.evaluate(() => window.scrollY);
    expect(scrolledY).toBeGreaterThan(0);

    // 2. Reload the page
    // Note: We need to re-inject the script after reload as it's a new page
    await comicPage.reload();
    
    // Re-inject script (mimicking Tampermonkey behavior on reload)
    const fs = require('fs');
    const path = require('path');
    const userScript = fs.readFileSync(path.resolve(__dirname, '../../dist/comic-viewer-helper.user.js'), 'utf8');
    await comicPage.addScriptTag({ content: userScript });

    // 3. Check for resume notification
    const notification = comicPage.locator('#comic-helper-resume-notification');
    await expect(notification).toBeVisible({ timeout: 5000 });

    // 4. Click "Continue"
    const continueBtn = comicPage.locator('.comic-helper-resume-continue');
    await continueBtn.click();

    // 5. Verify scroll position is restored
    await comicPage.waitForFunction((targetY) => Math.abs(window.scrollY - targetY) < 10, scrolledY);
    const finalY = await comicPage.evaluate(() => window.scrollY);
    expect(Math.abs(finalY - scrolledY)).toBeLessThan(10);
  });
});
