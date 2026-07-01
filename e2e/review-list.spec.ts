import { test, expect } from '@playwright/test';
import { setupStudentMocks, mockAuthLogin, loginAs } from './mocks/handlers';
import { makeReviewAssignments, ASSIGNMENT_ID } from './mocks/fixtures';

test.describe('Сценарии 3.1 и 3.8: Список проверок', () => {

    test.beforeEach(async ({ page }) => {
        await page.route(/\/api\/users\/me/, async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'student-a', username: 'Студент А' }) });
        });
        await mockAuthLogin(page, 'student-a');
        await loginAs(page, 'student-a');
    });

    test('3.1 — студент видит 2 карточки: «Ожидает» с «Начать проверку» и «В процессе» с «Продолжить», с таймером', async ({ page }) => {
        const futureDate = new Date(Date.now() + 7 * 86400000).toISOString();

        await setupStudentMocks(page, [
            {
                id: 'rev-pending',
                taskId: ASSIGNMENT_ID,
                taskTitle: 'Домашнее задание №1',
                submissionId: 'sub-b',
                reviewTargetType: 'submission',
                status: 'pending',
                assignedAt: '2026-06-20T10:00:00Z',
                dueAt: futureDate,
            },
            {
                id: 'rev-opened',
                taskId: ASSIGNMENT_ID,
                taskTitle: 'Домашнее задание №2',
                submissionId: 'sub-c',
                reviewTargetType: 'submission',
                status: 'opened',
                assignedAt: '2026-06-20T10:00:00Z',
                dueAt: futureDate,
            },
        ]);

        await page.goto('/assignments');
        await page.locator('button:has-text("Мои проверки")').click();

        await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=Домашнее задание №2')).toBeVisible();

        await expect(page.locator('text=Ожидает')).toBeVisible();
        await expect(page.locator('text=В процессе')).toBeVisible();

        await expect(page.locator('button:has-text("Начать проверку")')).toBeVisible();
        await expect(page.locator('button:has-text("Продолжить")')).toBeVisible();

        const timeElements = page.locator('text=/\\d+ч\\s*\\d+м/');
        const timeCount = await timeElements.count();
        expect(timeCount).toBeGreaterThanOrEqual(1);
    });

    test('3.8 — нет проверок: «Нет назначенных проверок»', async ({ page }) => {
        await setupStudentMocks(page, []);

        await page.goto('/assignments');
        await page.locator('button:has-text("Мои проверки")').click();

        await expect(page.locator('text=Нет назначенных проверок')).toBeVisible({ timeout: 5000 });
    });
});
