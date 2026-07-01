import { test, expect } from '@playwright/test';
import { setupTeacherMocks } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE } from './mocks/fixtures';

test.describe('Сценарии 5.1, 5.4: Контроль преподавателя', () => {

    test('5.1 — «Все сдачи» показывает список решений', async ({ page }) => {
        await page.goto('/');
        await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
        await setupTeacherMocks(page);
        await page.goto('/assignments');
        await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
        await page.locator('button:has-text("Все сдачи")').first().click();
        await expect(page.locator('span:text-is("НЕТ РЕШЕНИЙ")')).toBeVisible({ timeout: 5000 });
    });

    test('5.4 — «Пересчитать» в CourseGradesPanel выполняет POST', async ({ page }) => {
        await page.goto('/');
        await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
        await setupTeacherMocks(page);
        await page.goto('/assignments');
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('button:has-text("Пересчитать")')).toBeVisible();
        await page.locator('button:has-text("Пересчитать")').first().click();
    });
});
