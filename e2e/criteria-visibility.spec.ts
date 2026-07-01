import { test, expect } from '@playwright/test';
import { setupTeacherMocks } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE } from './mocks/fixtures';

test.describe('Сценарии 1.4 и 1.5: Видимость критериев', () => {

    test('1.4 — скрытые критерии: panel показывает пустой список', async ({ page }) => {
        await page.goto('/');
        await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
        await setupTeacherMocks(page);
        await page.route(/\/api\/tasks\/.*\/criteria/, async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json',
                body: JSON.stringify({ criteria: [], hidden: true }) });
        });
        await page.goto('/assignments');
        await page.locator('button:has-text("Критерии")').first().click();
        await expect(page.locator('text=Критерии задания')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=Критерии пока не добавлены.')).toBeVisible();
    });

    test('1.5 — видимые критерии отображаются', async ({ page }) => {
        await page.goto('/');
        await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
        await setupTeacherMocks(page);
        await page.goto('/assignments');
        await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
        await page.locator('button:has-text("Критерии")').first().click();
        await expect(page.locator('text=Критерии задания')).toBeVisible({ timeout: 5000 });
    });
});
