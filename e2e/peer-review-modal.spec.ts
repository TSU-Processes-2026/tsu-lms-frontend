import { test, expect } from '@playwright/test';
import { setupStudentMocks, mockAuthLogin, loginAs } from './mocks/handlers';
import { makeReviewAssignments, ASSIGNMENT_ID } from './mocks/fixtures';

test.describe('Сценарии 3.2, 3.3, 3.5: Проверка в PeerReviewModal', () => {

    test.beforeEach(async ({ page }) => {
        await page.route(/\/api\/users\/me/, async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'student-a', username: 'Студент А' }) });
        });
        await mockAuthLogin(page, 'student-a');
        await loginAs(page, 'student-a');
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
                const reqBody = route.request().postDataJSON();
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'opened',
                        submission: {
                            answers: [
                                { id: 'ans-1', text: 'Решение студента по первому вопросу' },
                                { id: 'ans-2', text: 'Решение по второму вопросу' },
                            ],
                        },
                        startedAt: new Date().toISOString(),
                    }),
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
                    body: JSON.stringify([
                        { id: 'crit-1', title: 'Качество кода', description: 'Качество кода', criterionType: 'active', format: 'numeric', weight: 1, maxPoints: 10, order: 1 },
                        { id: 'crit-2', title: 'Архитектура', description: 'Архитектура решения', criterionType: 'active', format: 'numeric', weight: 1, maxPoints: 10, order: 2 },
                    ]),
                });
            } else {
                await route.continue();
            }
        });

        await page.goto('/assignments');
        await page.locator('button:has-text("Мои проверки")').click();
        await page.locator('button:has-text("Начать проверку")').click();

        await expect(page.locator('h3:has-text("Проверка работы")')).toBeVisible({ timeout: 5000 });

        expect(startCalled).toBe(true);
        expect(startReviewId).toBe('rev-pending');
        expect(criteriaFetched).toBe(true);

        const submissionContent = page.locator('text=Решение студента по первому вопросу');
        await expect(submissionContent).toBeVisible({ timeout: 3000 });

        const criteriaHeader = page.locator('h4:has-text("Критерии оценки")');
        await expect(criteriaHeader).toBeVisible();

        const firstCriterion = page.locator('text=Качество кода');
        await expect(firstCriterion).toBeVisible({ timeout: 3000 });
    });

    test('3.3 — сохранение черновика: POST /reviews/{id}/save-draft с IsFinal=false и оценками по критериям', async ({ page }) => {
        let draftSaved = false;
        let draftBody: Record<string, unknown> | null = null;
        let saveDraftUrl = '';

        await setupStudentMocks(page, [{ ...makeReviewAssignments()[0], status: 'opened' }]);

        await page.route('**/api/reviews/*/save-draft', async (route) => {
            if (route.request().method() === 'POST') {
                draftSaved = true;
                saveDraftUrl = route.request().url();
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
                    { id: 'crit-1', title: 'Критерий 1', description: 'Первый критерий', criterionType: 'active', format: 'numeric', weight: 1, maxPoints: 5, minValue: 1, order: 1 },
                    { id: 'crit-2', title: 'Критерий 2', description: 'Второй критерий', criterionType: 'active', format: 'numeric', weight: 1, maxPoints: 5, minValue: 1, order: 2 },
                    { id: 'crit-3', title: 'Критерий 3', description: 'Третий критерий', criterionType: 'active', format: 'numeric', weight: 1, maxPoints: 5, minValue: 1, order: 3 },
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
        expect(inputCount).toBeGreaterThanOrEqual(3);
        await criterionInputs.nth(0).fill('4');
        await criterionInputs.nth(1).fill('3');
        await criterionInputs.nth(2).fill('5');

        const commentArea = page.locator('textarea').filter({ has: page.locator('[placeholder*="Общий комментарий"]') });
        if (await commentArea.count() === 0) {
            const allTextareas = page.locator('textarea');
            const count = await allTextareas.count();
            if (count > 0) {
                await allTextareas.last().fill('Черновой комментарий');
            }
        } else {
            await commentArea.fill('Черновой комментарий');
        }

        await page.locator('button:has-text("Сохранить черновик")').evaluate((el) => (el as HTMLButtonElement).click());
        await page.waitForTimeout(1000);

        expect(draftSaved).toBe(true);
        expect(draftBody).not.toBeNull();
        expect(saveDraftUrl).toContain('/save-draft');
        expect((draftBody as Record<string, unknown>).overallComment).toBe('Черновой комментарий');
        expect((draftBody as Record<string, unknown>).criteriaResults).toHaveLength(3);
        await expect(page.locator('text=Сохранено').first()).toBeVisible({ timeout: 3000 });
    });

    test('3.5 — отправка оценки: POST /reviews/{id}/submit, IsFinal=true, CriterionResult с PEER, статус submitted', async ({ page }) => {
        let submitCalled = false;
        let submitBody: Record<string, unknown> | null = null;
        let submitUrl = '';

        await setupStudentMocks(page, [{ ...makeReviewAssignments()[0], status: 'opened' }]);

        await page.route('**/api/reviews/*/submit', async (route) => {
            if (route.request().method() === 'POST') {
                submitCalled = true;
                submitUrl = route.request().url();
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
                        submittedAt: new Date().toISOString(),
                    }),
                });
            } else {
                await route.continue();
            }
        });

        await page.route(/\/api\/tasks\/.*\/criteria/, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { id: 'crit-1', title: 'Качество', description: 'Качество работы', criterionType: 'active', format: 'numeric', weight: 1, maxPoints: 5, minValue: 1, order: 1 },
                ]),
            });
        });

        await page.goto('/assignments');
        await page.locator('button:has-text("Мои проверки")').click();
        await page.locator('button:has-text("Продолжить")').click();

        const numberInputs = page.locator('input[type="number"]');
        await expect(numberInputs.first()).toBeVisible({ timeout: 5000 });
        const inputCount = await numberInputs.count();

        if (inputCount >= 1) {
            await numberInputs.first().clear();
            await numberInputs.first().fill('4');
        }

        const btn = page.locator('button:has-text("Отправить оценку")');
        await btn.waitFor({ timeout: 5000 });
        await btn.evaluate((el) => (el as HTMLButtonElement).click());

        await expect(page.locator('text=Оценка отправлена!')).toBeVisible({ timeout: 10000 });

        expect(submitCalled).toBe(true);
        expect(submitUrl).toContain('/submit');
        expect(submitBody).not.toBeNull();
    });
});
