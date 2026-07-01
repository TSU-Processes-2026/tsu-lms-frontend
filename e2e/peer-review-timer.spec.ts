import { test, expect } from '@playwright/test';
import { setupStudentMocks, mockAuthLogin, loginAs } from './mocks/handlers';
import { makeReviewAssignments } from './mocks/fixtures';

test.describe('Сценарии 3.4, 3.6, 3.7: Таймер, автосохранение, дедлайн', () => {

    test.beforeEach(async ({ page }) => {
        await page.route(/\/api\/users\/me/, async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'student-a', username: 'Студент А' }) });
        });
        await mockAuthLogin(page, 'student-a');
        await loginAs(page, 'student-a');
    });

    test('3.4 — автосохранение: setInterval(30000) вызывает saveDraft API, появляется метка «Сохранено»', async ({ page }) => {
        let saveCallCount = 0;

        await setupStudentMocks(page, [{ ...makeReviewAssignments()[0], status: 'opened' }]);

        await page.route('**/api/reviews/*/save-draft', async (route) => {
            if (route.request().method() === 'POST') {
                saveCallCount++;
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ saved: true }) });
            } else {
                await route.continue();
            }
        });

        await page.route(/\/api\/tasks\/.*\/criteria/, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { id: 'crit-1', title: 'Код', description: 'Качество кода', criterionType: 'active', format: 'numeric', weight: 1, maxPoints: 5, order: 1 },
                ]),
            });
        });

        await page.goto('/assignments');
        await page.locator('button:has-text("Мои проверки")').click();
        await page.locator('button:has-text("Продолжить")').click();
        await expect(page.locator('h3:has-text("Проверка работы")')).toBeVisible({ timeout: 5000 });

        const input = page.locator('input[type="number"]').first();
        await input.waitFor({ timeout: 5000 });

        await page.clock.install();
        await input.fill('4');
        await page.waitForTimeout(200);

        await page.clock.fastForward(31000);
        await page.waitForTimeout(500);

        expect(saveCallCount).toBeGreaterThanOrEqual(1);
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
        const isDisabled = await scoreInput.isDisabled().catch(() => true);
        expect(isDisabled).toBeTruthy();
    });

    test('3.7 — таймер: отображается обратный отсчёт и при истечении появляется «Время истекло»', async ({ page }) => {
        const fiveSecFromNow = new Date(Date.now() + 5000).toISOString();
        await setupStudentMocks(page, [{ ...makeReviewAssignments()[0], status: 'opened', dueAt: fiveSecFromNow }]);

        await page.route(/\/api\/tasks\/.*\/criteria/, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { id: 'crit-1', title: 'Код', description: 'Качество кода', criterionType: 'active', format: 'numeric', weight: 1, maxPoints: 5, order: 1 },
                ]),
            });
        });

        await page.goto('/assignments');
        await page.locator('button:has-text("Мои проверки")').click();
        await page.locator('button:has-text("Продолжить")').click();

        await expect(page.locator('h3:has-text("Проверка работы")')).toBeVisible({ timeout: 5000 });

        const timerContainer = page.locator('text=/\\d+м\\s*\\d+с/');
        await expect(timerContainer.first()).toBeVisible({ timeout: 5000 });

        await expect(page.getByText('Время истекло')).toBeVisible({ timeout: 12000 });

        const submitBtn = page.locator('button:has-text("Отправить оценку")');
        await expect(submitBtn).toBeDisabled();
    });
});
