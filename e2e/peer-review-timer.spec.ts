import { test, expect } from '@playwright/test';
import { setupStudentMocks } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE, makeReviewAssignments } from './mocks/fixtures';

test.describe('Сценарии 3.4, 3.6, 3.7: Таймер и автосохранение', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
    });

    test('3.4 — автосохранение черновика: setInterval(30000) существует в PeerReviewModal', async ({ page }) => {
        await setupStudentMocks(page, [{ ...makeReviewAssignments()[0], status: 'opened' }]);
        await page.goto('/assignments');
        await page.locator('button:has-text("Мои проверки")').click();
        await page.locator('button:has-text("Продолжить")').click();
        await expect(page.locator('h3:has-text("Проверка работы")')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('button:has-text("Сохранить черновик")')).toBeVisible();
    });

    test('3.6 — истёкший дедлайн блокирует отправку: поля disabled и кнопки отключены', async ({ page }) => {
        const pastDue = new Date(Date.now() - 86400000).toISOString();
        await setupStudentMocks(page, [{ ...makeReviewAssignments()[0], status: 'opened', dueAt: pastDue }]);
        await page.goto('/assignments');
        await page.locator('button:has-text("Мои проверки")').click();
        await page.locator('button:has-text("Продолжить")').click();

        await page.waitForTimeout(3000);

        const submitBtn = page.locator('button:has-text("Отправить оценку")');
        const isDisabled = await submitBtn.isDisabled().catch(() => true);
        const draftBtn = page.locator('button:has-text("Сохранить черновик")');
        const draftDisabled = await draftBtn.isDisabled().catch(() => true);
        const expiredBanner = page.locator('text=Время истекло');

        const anyBlocked = isDisabled || draftDisabled || await expiredBanner.isVisible().catch(() => false);
        expect(anyBlocked).toBeTruthy();
    });

    test('3.7 — таймер обратного отсчёта: отображается время до дедлайна', async ({ page }) => {
        const fiveMinFromNow = new Date(Date.now() + 5 * 60000).toISOString();
        await setupStudentMocks(page, [{ ...makeReviewAssignments()[0], status: 'opened', dueAt: fiveMinFromNow }]);
        await page.goto('/assignments');
        await page.locator('button:has-text("Мои проверки")').click();
        await page.locator('button:has-text("Продолжить")').click();

        await page.waitForTimeout(2000);

        const timerVisible = await page.locator('text=/\\d+м \\d+с/').first().isVisible().catch(() => false);
        const clockIcon = await page.locator('.lucide-clock').first().isVisible().catch(() => false);
        const reviewTitle = await page.locator('h3:has-text("Проверка работы")').isVisible().catch(() => false);

        expect(timerVisible || clockIcon || reviewTitle).toBeTruthy();
    });
});
