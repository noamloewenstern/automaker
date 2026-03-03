/**
 * Settings Env Vars Persistence E2E Test
 *
 * Validates the full round-trip for Claude Code CLI env vars:
 * UI → server save → page reload → hydration → UI
 *
 * This catches missing fields in hydrateStoreFromSettings().
 */

import { test, expect } from '@playwright/test';
import { authenticateForTests } from '../utils';

test.describe('Claude Code env vars persistence', () => {
  test('env vars survive page reload', async ({ page }) => {
    await authenticateForTests(page);

    // 1. Navigate to Settings
    await page.goto('/settings');
    await page.waitForLoadState('load');
    await page
      .locator('[data-testid="settings-view"]')
      .waitFor({ state: 'visible', timeout: 10000 });

    // 2. Click on Claude provider tab
    await page.locator('button:has-text("Claude")').first().click();

    // 3. Find the "Environment Variables" section and click "Add"
    const envVarsSection = page.locator('text=Environment Variables').locator('..');
    const addButton = envVarsSection.locator('button:has-text("Add")');
    await addButton.click();

    // 4. Fill in the key and value
    const keyInput = envVarsSection.locator('input[placeholder="Variable name"]');
    const valueInput = envVarsSection.locator('input[placeholder="Value"]');
    await keyInput.fill('TEST_E2E_VAR');
    await valueInput.fill('hello123');

    // 5. Wait for debounced save to complete (settings sync uses ~1s debounce)
    await page.waitForTimeout(2000);

    // 6. Reload the page
    await page.reload();
    await page.waitForLoadState('load');
    await page
      .locator('[data-testid="settings-view"]')
      .waitFor({ state: 'visible', timeout: 10000 });

    // 7. Navigate back to Claude tab
    await page.locator('button:has-text("Claude")').first().click();

    // 8. Assert the env var key/value is still present
    const envVarsSectionAfter = page.locator('text=Environment Variables').locator('..');
    const keyInputAfter = envVarsSectionAfter.locator('input[placeholder="Variable name"]');
    const valueInputAfter = envVarsSectionAfter.locator('input[placeholder="Value"]');

    await expect(keyInputAfter).toHaveValue('TEST_E2E_VAR');
    await expect(valueInputAfter).toHaveValue('hello123');
  });
});
