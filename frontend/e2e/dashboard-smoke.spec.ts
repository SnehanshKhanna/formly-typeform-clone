import { test, expect } from '@playwright/test';

test.describe('Dashboard Smoke', () => {
  test('should load forms, allow search, and create a new form', async ({ page }) => {
    // 1. Visit dashboard
    await page.goto('/');
    
    // Check header
    await expect(page.locator('h1', { hasText: 'My forms' })).toBeVisible();

    // The seeded db has "Customer Satisfaction Survey", "Event RSVP", "Upcoming product"
    await expect(page.locator('text=Customer Satisfaction Survey')).toBeVisible();
    await expect(page.locator('text=Event RSVP')).toBeVisible();

    // 2. Search
    await page.fill('input[placeholder="Search forms..."]', 'event');
    // "Customer Satisfaction Survey" should disappear
    await expect(page.locator('text=Customer Satisfaction Survey')).not.toBeVisible();
    await expect(page.locator('text=Event RSVP')).toBeVisible();

    // Clear search
    await page.fill('input[placeholder="Search forms..."]', '');
    await expect(page.locator('text=Customer Satisfaction Survey')).toBeVisible();

    // 3. Create new form
    await page.click('text=Create form');
    await expect(page.locator('text=Create new form')).toBeVisible();
    
    // Fill title
    await page.fill('input[placeholder="Form title"]', 'My Automated Form');
    await page.locator('[role="dialog"]').locator('button:has-text("Create form")').click(); // Click the primary button in dialog

    // Should navigate to builder
    await expect(page).toHaveURL(/\/forms\/[a-zA-Z0-9-]+\/create/);
    
    // Go back to dashboard
    await page.goto('/');
    await expect(page.getByText('My Automated Form').first()).toBeVisible();
  });
});
