import { test, expect } from '@playwright/test';
import { setupStudentMocks } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE, makeReviewAssignments } from './mocks/fixtures';

test.describe('Сценарии 3.2, 3.3, 3.5: Проверка в PeerReviewModal', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
    });

    test('3.2 — начало проверки: POST /reviews/{id}/start → статус opened, показ решения и критериев', async ({ page }) => {
        let startCalled = false;
        let startReviewId: string | null = null;
        let criteriaFetched = false;

        await setupStudentMocks(page, makeReviewAssignments());

        await page.route('**/api/reviews/*/start', async (route) => {
            if (route.request().method() === 'POST') {
                startCalled = true;
                const url = route.request().url();
                const match = url.match(/\/reviews\/([^/?]+)\/start/);
                startReviewId = match ? match[1] : null;
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: 'opened', submission: { answers: { q1: 'Решение студента' } } }),
                });
            } else {
                await route.continue();
            }
        });

        await page.route(/\/api\/tasks\/.*\/criteria/, async (route) => {
            if (route.request().method() === 'GET') {
                criteriaFetched = true;
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([{ id: 'crit-1', title: 'Код', description: 'Качество кода', criterionType: 'active', format: 'numeric', weight: 1, maxPoints: 10 }]),
                });
            } else {
                await route.continue();
            }
        });

        await page.goto('/assignments');
        await page.locator('button:has-text("Мои проверки")').click();
        await page.locator('button:has-text("Начать проверку")').click();

        await expect(page.locator('h3:has-text("Проверка работы")')).toBeVisible({ timeout: 5000 });
        await page.waitForTimeout(1000);

        expect(startCalled).toBe(true);
        expect(startReviewId).toBe('rev-pending');
        expect(criteriaFetched).toBe(true);

        await expect(page.locator('text=Решение студента').first()).toBeVisible({ timeout: 3000 });
        await expect(page.locator('text=Качество кода').first()).toBeVisible({ timeout: 3000 });
    });

    test('3.3 — сохранение черновика: POST /reviews/{id}/save-draft с IsFinal=false и оценками по критериям', async ({ page }) => {
        let draftSaved = false;
        let draftBody: Record<string, unknown> | null = null;

        await setupStudentMocks(page, [{ ...makeReviewAssignments()[0], status: 'opened' }]);

        await page.route('**/api/reviews/*/save-draft', async (route) => {
            if (route.request().method() === 'POST') {
                draftSaved = true;
                draftBody = route.request().postDataJSON();
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ saved: true, status: 'opened' }) });
            } else {
                await route.continue();
            }
        });

        await page.route(/\/api\/tasks\/.*\/criteria/, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { id: 'crit-1', title: 'Критерий 1', description: 'Первый критерий', criterionType: 'active', format: 'numeric', weight: 1, maxPoints: 5 },
                    { id: 'crit-2', title: 'Критерий 2', description: 'Второй критерий', criterionType: 'active', format: 'numeric', weight: 1, maxPoints: 5 },
                    { id: 'crit-3', title: 'Критерий 3', description: 'Третий критерий', criterionType: 'active', format: 'numeric', weight: 1, maxPoints: 5 },
                ]),
            });
        });

        await page.goto('/assignments');
        await page.locator('button:has-text("Мои проверки")').click();
        await page.locator('button:has-text("Продолжить")').click();

        await expect(page.locator('h3:has-text("Проверка работы")')).toBeVisible({ timeout: 5000 });
        await page.waitForTimeout(1500);

        const criterionInputs = page.locator('input[type="number"]');
        const inputCount = await criterionInputs.count();
        if (inputCount >= 3) {
            await criterionInputs.nth(0).fill('4');
            await criterionInputs.nth(1).fill('3');
            await criterionInputs.nth(2).fill('5');
        }

        const commentArea = page.locator('textarea[placeholder*="Общий комментарий"]').first();
        await commentArea.waitFor({ timeout: 5000 });
        await commentArea.fill('Черновой комментарий');

        await page.locator('button:has-text("Сохранить черновик")').evaluate((el) => (el as HTMLButtonElement).click());
        await page.waitForTimeout(1000);

        expect(draftSaved).toBe(true);
        expect(draftBody).not.toBeNull();
        expect((draftBody as Record<string, unknown>).overallComment).toBe('Черновой комментарий');
        expect((draftBody as Record<string, unknown>).criteriaResults).toHaveLength(3);
        await expect(page.locator('text=Сохранено').first()).toBeVisible({ timeout: 3000 });
    });

    test('3.5 — отправка оценки: POST /reviews/{id}/submit, IsFinal=true, CriterionResult с PEER, статус submitted', async ({ page }) => {
        let submitCalled = false;
        let submitBody: Record<string, unknown> | null = null;

        await setupStudentMocks(page, [{ ...makeReviewAssignments()[0], status: 'opened' }]);

        await page.route('**/api/reviews/*/submit', async (route) => {
            if (route.request().method() === 'POST') {
                submitCalled = true;
                submitBody = route.request().postDataJSON();
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'submitted',
                        isFinal: true,
                        criterionResults: [
                            { criterionId: 'crit-1', value: 4, assessmentType: 'PEER' },
                        ],
                    }),
                });
            } else {
                await route.continue();
            }
        });

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

        await expect(page.locator('text=Оценка отправлена!')).toBeVisible({ timeout: 10000 });

        expect(submitCalled).toBe(true);
        expect(submitBody).not.toBeNull();
        expect((submitBody as Record<string, unknown>).overallScore).toBe(4);
    });
});
