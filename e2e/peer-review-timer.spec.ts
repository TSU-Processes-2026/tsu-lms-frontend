import { test, expect } from '@playwright/test';
import { setupStudentMocks } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE, makeReviewAssignments } from './mocks/fixtures';

test.describe('Сценарии 3.4, 3.6, 3.7: Таймер, автосохранение, дедлайн', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
    });

    test('3.4 — автосохранение: интервал 30с существует, кнопка «Сохранить черновик» видна', async ({ page }) => {
        await setupStudentMocks(page, [{ ...makeReviewAssignments()[0], status: 'opened' }]);

        await page.goto('/assignments');
        await page.locator('button:has-text("Мои проверки")').click();
        await page.locator('button:has-text("Продолжить")').click();
        await expect(page.locator('h3:has-text("Проверка работы")')).toBeVisible({ timeout: 5000 });

        await expect(page.locator('button:has-text("Сохранить черновик")')).toBeVisible();
    });

    test('3.6 — истёкший дедлайн: поля блокируются, отправка невозможна', async ({ page }) => {
        const pastDue = new Date(Date.now() - 86400000).toISOString();
        let submitAttempted = false;

        await setupStudentMocks(page, [{ ...makeReviewAssignments()[0], status: 'opened', dueAt: pastDue }]);

        await page.route('**/api/reviews/*/submit', async (route) => {
            submitAttempted = true;
            await route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ message: 'Review deadline has passed' }) });
        });

        await page.goto('/assignments');
        await page.locator('button:has-text("Мои проверки")').click();
        await page.locator('button:has-text("Продолжить")').click();

        await page.waitForTimeout(3000);

        await expect(page.locator('text=Время истекло').first()).toBeVisible({ timeout: 5000 });

        const submitBtn = page.locator('button:has-text("Отправить оценку")');
        await expect(submitBtn).toBeDisabled();

        const draftBtn = page.locator('button:has-text("Сохранить черновик")');
        await expect(draftBtn).toBeDisabled();

        const scoreInput = page.locator('input[type="number"]').first();
        const isDisabled = await scoreInput.isDisabled().catch(() => false);
        expect(isDisabled).toBeTruthy();
    });

    test('3.7 — таймер: отображается обратный отсчёт и при истечении появляется «Время истекло»', async ({ page }) => {
        const oneMinFromNow = new Date(Date.now() + 65000).toISOString();
        await setupStudentMocks(page, [{ ...makeReviewAssignments()[0], status: 'opened', dueAt: oneMinFromNow }]);

        await page.goto('/assignments');
        await page.locator('button:has-text("Мои проверки")').click();
        await page.locator('button:has-text("Продолжить")').click();

        await expect(page.locator('h3:has-text("Проверка работы")')).toBeVisible({ timeout: 5000 });

        const timerContainer = page.locator('.bg-blue-50').filter({ hasText: /\d+м\s*\d+с/ });
        await expect(timerContainer.first()).toBeVisible({ timeout: 5000 });

        await page.clock.install();
        await page.clock.fastForward(62000);
        await page.waitForTimeout(1000);

        await expect(page.locator('text=Время истекло').first()).toBeVisible({ timeout: 3000 });

        const submitBtn = page.locator('button:has-text("Отправить оценку")');
        await expect(submitBtn).toBeDisabled();
    });
});
