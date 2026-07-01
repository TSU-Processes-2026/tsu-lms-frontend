import { test, expect } from '@playwright/test';
import { setupTeacherMocks } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE } from './mocks/fixtures';

test.describe('Feature 1: Настройка критериев', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate((token) => {
            localStorage.setItem('accessToken', token);
        }, ACCESS_TOKEN_VALUE);
        await setupTeacherMocks(page);
    });

    test.describe('Scenario 1.2: Создание критерия с типом «активный»', () => {
        test('преподаватель нажимает "Критерии" и добавляет активный критерий', async ({ page }) => {
            await page.goto('/assignments');

            await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });

            await page.locator('button:has-text("Критерии")').first().click();

            await expect(page.locator('text=Критерии задания')).toBeVisible({ timeout: 5000 });

            await expect(page.locator('button[aria-label="Закрыть"]')).not.toBeAttached();

            await page.locator('button:has-text("Добавить критерий")').click();

            await page.locator('input[placeholder="Описание критерия"]').fill('Качество кода');

            await page.locator('select').nth(0).selectOption('active');

            await page.locator('select').nth(1).selectOption('numeric');

            await page.locator('select').nth(2).selectOption('student');

            await page.locator('select').nth(3).selectOption('cumulative');

            await page.locator('input[placeholder="Макс. балл"]').fill('10');

            await page.locator('input[placeholder="Мин. значение"]').fill('0');

            await page.locator('button:has-text("Добавить"):not(:has-text("критерий"))').last().click();

            await expect(page.locator('text=Качество кода')).toBeVisible({ timeout: 5000 });
            await expect(page.locator('text=Активный').first()).toBeVisible();
            await expect(page.locator('text=Число')).toBeVisible();
            await expect(page.locator('text=Макс. балл: 10')).toBeVisible();
        });
    });

    test.describe('Scenario 1.3: Создание критерия с типом «пассивный» и штрафом', () => {
        test('преподаватель создаёт пассивный штрафной критерий', async ({ page }) => {
            await page.goto('/assignments');

            await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });

            await page.locator('button:has-text("Критерии")').first().click();

            await expect(page.locator('text=Критерии задания')).toBeVisible({ timeout: 5000 });

            await expect(page.locator('button[aria-label="Закрыть"]')).not.toBeAttached();

            await page.locator('button:has-text("Добавить критерий")').click();

            await page.locator('input[placeholder="Описание критерия"]').fill('Соблюдение сроков');

            await page.locator('select').nth(0).selectOption('passive');

            await page.locator('select').nth(1).selectOption('checklist');

            await page.locator('label').filter({ hasText: 'Штраф' }).locator('input[type="checkbox"]').check();

            await page.locator('button:has-text("Добавить"):not(:has-text("критерий"))').last().click();

            await expect(page.locator('text=Соблюдение сроков')).toBeVisible({ timeout: 5000 });
            await expect(page.locator('text=Пассивный').first()).toBeVisible();
            await expect(page.locator('text=Чеклист')).toBeVisible();
            await expect(page.locator('text=Штраф').first()).toBeVisible();
        });
    });
});
