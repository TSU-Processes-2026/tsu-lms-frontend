import { test, expect } from '@playwright/test';
import { setupStudentMocks } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE, makeReviewAssignments } from './mocks/fixtures';

test.describe('Сценарии 3.1 и 3.8: Список проверок', () => {

    test('3.1 — студент видит список с «Ожидает» и «В процессе»', async ({ page }) => {
        await page.goto('/');
        await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
        await setupStudentMocks(page, [
            { ...makeReviewAssignments()[0], status: 'pending' },
            { ...makeReviewAssignments()[0], id: 'rev-2', submissionId: 'sub-c', status: 'opened' },
        ]);
        await page.goto('/assignments');
        await page.locator('button:has-text("Мои проверки")').click();
        await expect(page.locator('text=Ожидает')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=В процессе')).toBeVisible();
        await expect(page.locator('button:has-text("Начать проверку")')).toBeVisible();
        await expect(page.locator('button:has-text("Продолжить")')).toBeVisible();
    });

    test('3.8 — если нет проверок, показывает «Нет назначенных проверок»', async ({ page }) => {
        await page.goto('/');
        await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
        await setupStudentMocks(page, []);
        await page.goto('/assignments');
        await page.locator('button:has-text("Мои проверки")').click();
        await expect(page.locator('text=Нет назначенных проверок')).toBeVisible({ timeout: 5000 });
    });
});