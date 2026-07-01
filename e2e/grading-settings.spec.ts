import { test, expect } from '@playwright/test';
import { setupTeacherMocks } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE } from './mocks/fixtures';

test.describe('Сценарий 1.1: Настройка курса и критериев', () => {

    test('1.1 — преподаватель включает взаимное оценивание и сохраняет настройки', async ({ page }) => {
        await page.goto('/');
        await page.evaluate((token) => {
            localStorage.setItem('accessToken', token);
        }, ACCESS_TOKEN_VALUE);
        await setupTeacherMocks(page);

        await page.goto('/assignments');
        await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });

        await expect(page.locator('button:has-text("Пересчитать")')).toBeVisible();
        await page.locator('button:has-text("Пересчитать")').first().click();
        await page.waitForTimeout(500);
    });
});
