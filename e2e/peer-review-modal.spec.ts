import { test, expect } from '@playwright/test';
import { setupStudentMocks } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE, makeReviewAssignments } from './mocks/fixtures';

test.describe('Сценарии 3.2, 3.3, 3.5: Проверка в PeerReviewModal', () => {

    test('3.2 — начало проверки открывает PeerReviewModal', async ({ page }) => {
        await page.goto('/');
        await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
        await setupStudentMocks(page, makeReviewAssignments());
        await page.goto('/assignments');
        await page.locator('button:has-text("Мои проверки")').click();
        await page.locator('button:has-text("Начать проверку")').click();
        await expect(page.locator('h3:has-text("Проверка работы")')).toBeVisible({ timeout: 5000 });
    });

    test('3.3 — сохранение черновика', async ({ page }) => {
        await page.goto('/');
        await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
        await setupStudentMocks(page, [{ ...makeReviewAssignments()[0], status: 'opened' }]);
        await page.goto('/assignments');
        await page.locator('button:has-text("Мои проверки")').click();
        await page.locator('button:has-text("Продолжить")').click();
        await expect(page.locator('h3:has-text("Проверка работы")')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('button:has-text("Сохранить черновик")')).toBeVisible();
    });

    test('3.5 — отправка оценки после ввода 5-балльной оценки', async ({ page }) => {
        await page.goto('/');
        await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
        await setupStudentMocks(page, [{ ...makeReviewAssignments()[0], status: 'opened' }]);
        await page.goto('/assignments');
        await page.locator('button:has-text("Мои проверки")').click();
        await page.locator('button:has-text("Продолжить")').click();
        const scoreInput = page.locator('input[type="number"]').first();
        await scoreInput.waitFor({ timeout: 5000 });
        await scoreInput.clear();
        await scoreInput.fill('4');
        const btn = page.locator('button:has-text("Отправить оценку")');
        await btn.waitFor({ timeout: 5000 });
        await btn.evaluate((el) => (el as HTMLButtonElement).click());
        await page.waitForTimeout(1500);
        await expect(page.locator('text=Оценка отправлена!')).toBeVisible({ timeout: 10000 });
    });
});
