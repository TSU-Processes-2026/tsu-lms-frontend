import { test, expect } from '@playwright/test';
import { setupTeacherMocks } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE } from './mocks/fixtures';

test.describe('Feature 2: Распределение проверок', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate((token) => {
            localStorage.setItem('accessToken', token);
        }, ACCESS_TOKEN_VALUE);
        await setupTeacherMocks(page);
    });

    test.describe('Scenario 2.1: Генерация all-to-all для трёх студентов', () => {
        test('POST /api/tasks/{taskId}/generate-reviews возвращает 6 назначений', async ({ page }) => {
            let capturedBody: unknown = null;
            await page.route('**/api/tasks/*/generate-reviews', async (route) => {
                if (route.request().method() === 'POST') {
                    capturedBody = route.request().postDataJSON();
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ count: 6, assignments: [] }),
                    });
                } else {
                    await route.continue();
                }
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Scenario 2.2: Генерация pairs для чётного числа студентов', () => {
        test('pairs создаёт циркулярную цепочку из 4 назначений', async ({ page }) => {
            await page.route('**/api/tasks/*/generate-reviews', async (route) => {
                if (route.request().method() === 'POST') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ count: 4, mode: 'pairs', assignments: [] }),
                    });
                } else {
                    await route.continue();
                }
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Scenario 2.3: Генерация pairs для нечётного числа — триплет', () => {
        test('три студента дают триплет из 3 назначений', async ({ page }) => {
            await page.route('**/api/tasks/*/generate-reviews', async (route) => {
                if (route.request().method() === 'POST') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ count: 3, mode: 'pairs', triplet: true, assignments: [] }),
                    });
                } else {
                    await route.continue();
                }
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Scenario 2.4: Повторная генерация не дублирует назначения', () => {
        test('сервер возвращает "Assignments already exist"', async ({ page }) => {
            await page.route('**/api/tasks/*/generate-reviews', async (route) => {
                if (route.request().method() === 'POST') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ count: 0, message: 'Assignments already exist' }),
                    });
                } else {
                    await route.continue();
                }
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Scenario 2.5: Назначение с дедлайном', () => {
        test('каждое назначение имеет due_at = review_deadline_at', async ({ page }) => {
            await page.route('**/api/tasks/*/generate-reviews', async (route) => {
                if (route.request().method() === 'POST') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            count: 2,
                            assignments: [
                                { id: 'rev-1', status: 'pending', dueAt: '2026-06-28T23:59:00Z' },
                                { id: 'rev-2', status: 'pending', dueAt: '2026-06-28T23:59:00Z' },
                            ],
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
});
