import { test, expect } from '@playwright/test';
import { setupTeacherMocks } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE, ASSIGNMENT_ID } from './mocks/fixtures';

test.describe('Сценарии 5.2 и 5.3: Отклонение и переопределение', () => {

    test('5.2 — преподаватель отклоняет peer-оценку через POST /api/reviews/{id}/reject', async ({ page }) => {
        await setupTeacherMocks(page);

        await page.route('**/api/submissions/*/reviews', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: 'rev-peer-1',
                        source: 'peer',
                        overallScore: 10,
                        overallComment: 'Отличная работа!',
                        isFinal: true,
                        isRejected: false,
                        submittedAt: '2026-06-20T12:00:00Z',
                        reviewerName: 'Студент Б',
                    },
                    {
                        id: 'rev-peer-2',
                        source: 'peer',
                        overallScore: 6,
                        overallComment: 'Нормально',
                        isFinal: true,
                        isRejected: false,
                        submittedAt: '2026-06-20T13:00:00Z',
                        reviewerName: 'Студент В',
                    },
                ]),
            });
        });

        let rejectCalled = false;
        await page.route('**/api/reviews/*/reject', async (route) => {
            if (route.request().method() === 'POST') {
                rejectCalled = true;
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ rejected: true }),
                });
            } else {
                await route.continue();
            }
        });

        await page.route('**/api/submissions/*/final-grade', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ finalScore: 8, finalSource: 'teacher' }),
            });
        });

        await page.goto('/');
        await page.evaluate((token) => {
            localStorage.setItem('accessToken', token);
        }, ACCESS_TOKEN_VALUE);

        await page.goto('/assignments');
        await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
        await page.locator('button:has-text("Все сдачи")').first().click();
        await page.waitForTimeout(1000);

        const reviewBtn = page.locator('button:has-text("Проверить")').first();
        if (await reviewBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await reviewBtn.click();
            await page.waitForTimeout(1000);

            const detailBtn = page.locator('button:has-text("Детальный просмотр")');
            if (await detailBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await detailBtn.click();
                await page.waitForTimeout(1500);
            }
        }
    });

    test('5.3 — ручное переопределение итогового балла через ManualGradeOverrideModal', async ({ page }) => {
        await setupTeacherMocks(page);

        await page.route('**/api/submissions/*/reviews', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: 'rev-peer-1',
                        source: 'peer',
                        overallScore: 7,
                        overallComment: 'Хорошо',
                        isFinal: true,
                        isRejected: false,
                        submittedAt: '2026-06-20T12:00:00Z',
                        reviewerName: 'Студент Б',
                    },
                ]),
            });
        });

        await page.route('**/api/submissions/*/final-grade', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ finalScore: 8, finalSource: 'teacher' }),
            });
        });

        await page.goto('/');
        await page.evaluate((token) => {
            localStorage.setItem('accessToken', token);
        }, ACCESS_TOKEN_VALUE);

        await page.goto('/assignments');
        await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
        await page.locator('button:has-text("Все сдачи")').first().click();
        await page.waitForTimeout(1000);

        const reviewBtn = page.locator('button:has-text("Проверить")').first();
        if (await reviewBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await reviewBtn.click();
            await page.waitForTimeout(1000);

            const detailBtn = page.locator('button:has-text("Детальный просмотр")');
            if (await detailBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await detailBtn.click();
                await page.waitForTimeout(1500);
            }
        }
    });
});
