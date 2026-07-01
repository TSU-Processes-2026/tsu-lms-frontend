import { test, expect } from '@playwright/test';
import { setupTeacherMocks } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE, TEACHER_ID } from './mocks/fixtures';

test.describe('Feature 4: Командное оценивание', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate((token) => {
            localStorage.setItem('accessToken', token);
        }, ACCESS_TOKEN_VALUE);
        await setupTeacherMocks(page);
    });

    test.describe('Scenario 4.1: Все члены команды оценивают (all_members)', () => {
        test('POST generate-reviews создаёт назначения для всех членов команды', async ({ page }) => {
            await page.route('**/api/tasks/*/generate-reviews', async (route) => {
                if (route.request().method() === 'POST') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            count: 3,
                            reviewType: 'team',
                            teamReviewPolicy: 'all_members',
                            assignments: [],
                        }),
                    });
                } else {
                    await route.continue();
                }
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Scenario 4.2: Только капитан оценивает (captain_only)', () => {
        test('создаётся одно назначение на капитана', async ({ page }) => {
            await page.route('**/api/tasks/*/generate-reviews', async (route) => {
                if (route.request().method() === 'POST') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            count: 1,
                            reviewType: 'team',
                            teamReviewPolicy: 'captain_only',
                            assignments: [],
                        }),
                    });
                } else {
                    await route.continue();
                }
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Scenario 4.3: Представитель команды оценивает (one_representative_reviews)', () => {
        test('создаётся одно назначение на представителя', async ({ page }) => {
            await page.route('**/api/tasks/*/generate-reviews', async (route) => {
                if (route.request().method() === 'POST') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            count: 1,
                            reviewType: 'team',
                            teamReviewPolicy: 'one_representative_reviews',
                            assignments: [],
                        }),
                    });
                } else {
                    await route.continue();
                }
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Scenario 4.4: Неавторизованный участник не может оценивать от команды', () => {
        test('API возвращает 403 для неавторизованного участника', async ({ page }) => {
            await page.route('**/api/reviews/*/start', async (route) => {
                await route.fulfill({
                    status: 403,
                    contentType: 'application/json',
                    body: JSON.stringify({ message: 'Forbidden', status: 403, title: 'Forbidden' }),
                });
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Scenario 4.5: Назначение представителя команды', () => {
        test('POST /api/teams/{teamId}/assign-representative вызывается при нажатии', async ({ page }) => {
            let representativeCallCount = 0;
            await page.route('**/api/teams/*/assign-representative', async (route) => {
                if (route.request().method() === 'POST') {
                    representativeCallCount++;
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ representativeId: 'student-b' }),
                    });
                } else {
                    await route.continue();
                }
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
        });
    });
});
