import { test, expect } from '@playwright/test';
import { setupTeacherMocks, routeJson } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE } from './mocks/fixtures';

test.describe('Сценарий 5.4: Контроль преподавателя', () => {

    test('5.4 — «Пересчитать» в CourseGradesPanel вызывает POST calculate-grades и обновляет таблицу', async ({ page }) => {
        let calculateCalled = false;
        let firstCall = true;

        await setupTeacherMocks(page);

        await page.route('**/api/courses/*/calculate-grades', async (route) => {
            if (route.request().method() === 'POST') {
                calculateCalled = true;
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
            } else {
                await route.continue();
            }
        });

        await page.route('**/api/courses/*/grades', async (route) => {
            if (firstCall) {
                firstCall = false;
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
            } else {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([{
                        studentId: 'student-a', studentName: 'Студент А',
                        finalScore: 7, finalGrade: '4', finalSource: 'peer', reviewerCount: 3,
                        calculatedAt: new Date().toISOString(),
                    }]),
                });
            }
        });

        await page.goto('/');
        await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);

        await page.goto('/assignments');
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Нет оценок')).toBeVisible({ timeout: 5000 });

        await page.locator('button:has-text("Пересчитать")').first().click();
        await page.waitForTimeout(2000);

        expect(calculateCalled).toBe(true);

        await expect(page.locator('text=Студент А')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('th:text-is("Источник")')).toBeVisible();
        await expect(page.locator('th:text-is("Проверок")')).toBeVisible();
        await expect(page.locator('text=Peer').first()).toBeVisible();
        await expect(page.locator('text=3').first()).toBeVisible();
    });
});
