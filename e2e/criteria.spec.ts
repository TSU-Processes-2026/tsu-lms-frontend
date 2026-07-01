import { test, expect } from '@playwright/test';
import { setupTeacherMocks } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE } from './mocks/fixtures';

test.describe('Feature 1: Настройка критериев', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate((token) => localStorage.setItem('accessToken', token), ACCESS_TOKEN_VALUE);
        await setupTeacherMocks(page);
    });

    test('1.2 — преподаватель добавляет активный критерий с проверкой POST-тела', async ({ page }) => {
        let postBody: Record<string, unknown> | null = null;
        const stored: unknown[] = [];

        await page.route('**/api/tasks/*/criteria', async (route) => {
            if (route.request().method() === 'POST') {
                postBody = route.request().postDataJSON();
                const item = { id: 'crit-1', taskId: 't1', order: 1, ...postBody };
                stored.push(item);
                await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(item) });
            } else if (route.request().method() === 'GET') {
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ criteria: stored, hidden: false }) });
            } else {
                await route.continue();
            }
        });

        await page.goto('/assignments');
        await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
        await page.locator('button:has-text("Критерии")').first().click();
        await expect(page.locator('text=Критерии задания')).toBeVisible({ timeout: 5000 });
        await page.locator('button:has-text("Добавить критерий")').click();

        await page.locator('input[placeholder="Описание критерия"]').fill('Качество кода');
        await page.locator('select').nth(0).selectOption('active');
        await page.locator('select').nth(1).selectOption('numeric');
        await page.locator('select').nth(2).selectOption('student');
        await page.locator('select').nth(3).selectOption('cumulative');
        await page.locator('input[placeholder="Макс. балл"]').fill('10');
        await page.locator('button:has-text("Добавить"):not(:has-text("критерий"))').last().click();

        await expect(page.locator('text=Качество кода').first()).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=Активный').first()).toBeVisible();
        await expect(page.locator('text=Число').first()).toBeVisible();
        await expect(page.locator('text=Макс. балл: 10')).toBeVisible();

        expect(postBody).not.toBeNull();
        expect((postBody as Record<string, unknown>).description).toBe('Качество кода');
        expect((postBody as Record<string, unknown>).criterionType).toBe('active');
        expect((postBody as Record<string, unknown>).format).toBe('numeric');
        expect((postBody as Record<string, unknown>).maxPoints).toBe(10);
    });

    test('1.3 — преподаватель создаёт пассивный штрафной критерий с проверкой isPenalty', async ({ page }) => {
        let postBody: Record<string, unknown> | null = null;
        const stored: unknown[] = [];

        await page.route('**/api/tasks/*/criteria', async (route) => {
            if (route.request().method() === 'POST') {
                postBody = route.request().postDataJSON();
                const item = { id: 'crit-1', taskId: 't1', order: 1, ...postBody };
                stored.push(item);
                await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(item) });
            } else if (route.request().method() === 'GET') {
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ criteria: stored, hidden: false }) });
            } else {
                await route.continue();
            }
        });

        await page.goto('/assignments');
        await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
        await page.locator('button:has-text("Критерии")').first().click();
        await expect(page.locator('text=Критерии задания')).toBeVisible({ timeout: 5000 });
        await page.locator('button:has-text("Добавить критерий")').click();

        await page.locator('input[placeholder="Описание критерия"]').fill('Соблюдение сроков');
        await page.locator('select').nth(0).selectOption('passive');
        await page.locator('select').nth(1).selectOption('checklist');
        await page.locator('label').filter({ hasText: 'Штраф' }).locator('input[type="checkbox"]').check();
        await page.locator('button:has-text("Добавить"):not(:has-text("критерий"))').last().click();

        await expect(page.locator('text=Соблюдение сроков').first()).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=Пассивный').first()).toBeVisible();
        await expect(page.locator('text=Чеклист').first()).toBeVisible();
        await expect(page.locator('text=Штраф').first()).toBeVisible();

        expect(postBody).not.toBeNull();
        expect((postBody as Record<string, unknown>).description).toBe('Соблюдение сроков');
        expect((postBody as Record<string, unknown>).criterionType).toBe('passive');
        expect((postBody as Record<string, unknown>).format).toBe('checklist');
        expect((postBody as Record<string, unknown>).isPenalty).toBe(true);
    });
});
