import { test as base, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Define a custom fixture that includes UserScript injection
type MyFixtures = {
  comicPage: Page;
};

export const test = base.extend<MyFixtures>({
  comicPage: async ({ page }, use) => {
    // 1. Go to the mock comic page
    await page.goto('/magazine/123/');

    // 2. Read the built UserScript
    const userScriptPath = path.resolve(__dirname, '../../dist/comic-viewer-helper.user.js');
    if (!fs.existsSync(userScriptPath)) {
        throw new Error(`UserScript not found at ${userScriptPath}. Did you run npm run build?`);
    }
    const userScript = fs.readFileSync(userScriptPath, 'utf8');

    // 3. Inject the script
    await page.addScriptTag({ content: userScript });

    // 4. Disable smooth scrolling for stability
    await page.addStyleTag({ content: 'html, body { scroll-behavior: auto !important; }' });

    // 5. Wait for the UI to be injected
    await page.waitForSelector('#comic-helper-ui', { state: 'attached', timeout: 5000 });

    await use(page);
  },
});

export { expect };
