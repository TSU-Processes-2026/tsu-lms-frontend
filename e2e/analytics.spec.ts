import { test, expect } from '@playwright/test';
import { setupTeacherMocks } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE } from './mocks/fixtures';

test.describe('Сценарии 7.1–7.4: Аналитика и экспорт', () => {

    test('7.1 — нажатие «Сводная аналитика» открывает таблицу', async ({ page }) => {
        await page.goto('/');
        await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
        await setupTeacherMocks(page);
        await page.goto('/assignments');
        await expect(page.locator('button:has-text("Сводная аналитика")')).toBeVisible({ timeout: 10000 });
        await page.locator('button:has-text("Сводная аналитика")').click();
        await page.waitForSelector('text=Студент', { timeout: 5000 });
        await expect(page.locator('th:text-is("Студент")')).toBeVisible();
    });

    test('7.2 — кнопка «CSV» для экспорта видна в таблице аналитики', async ({ page }) => {
        await page.goto('/');
        await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
        await setupTeacherMocks(page);
        await page.goto('/assignments');
        await page.locator('button:has-text("Сводная аналитика")').click();
        await page.waitForSelector('text=Студент', { timeout: 5000 });
        await expect(page.locator('text=CSV').first()).toBeVisible({ timeout: 5000 });
    });

    test('7.3 — пустая аналитика при отсутствии оценок', async ({ page }) => {
        await page.goto('/');
        await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
        await setupTeacherMocks(page);
        await page.route(/\/api\/courses\/.*\/analytics/, async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json',
                body: JSON.stringify({ rows: [] }) });
        });
        await page.goto('/assignments');
        await page.locator('button:has-text("Сводная аналитика")').click();
        await page.waitForSelector('text=Нет данных для отображения', { timeout: 5000 });
        await expect(page.locator('text=Нет данных для отображения')).toBeVisible();
    });

    test('7.4 — панель CourseGradesPanel содержит кнопку «Пересчитать»', async ({ page }) => {
        await page.goto('/');
        await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
        await setupTeacherMocks(page);
        await page.goto('/assignments');
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('button:has-text("Пересчитать")')).toBeVisible();
    });
});
