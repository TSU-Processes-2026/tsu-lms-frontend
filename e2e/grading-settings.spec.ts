import { test, expect } from '@playwright/test';
import { mockAuthLogin, loginAs, setupSubjectViewMocks } from './mocks/handlers';
import { SUBJECT_ID } from './mocks/fixtures';

test.describe('Настройка взаимного оценивания через UI', () => {
    test('1.1 — преподаватель включает взаимное оценивание, выбирает настройки и сохраняет через UI', async ({ page }) => {
        await mockAuthLogin(page);
        await setupSubjectViewMocks(page);

        let putBody: Record<string, unknown> | null = null;

        await page.route(/\/api\/subjects\/[^/?#]+$/, async (route) => {
            if (route.request().method() === 'PUT') {
                putBody = route.request().postDataJSON();
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ id: SUBJECT_ID, title: 'Математика', ...putBody }),
                });
            } else {
                await route.continue();
            }
        });

        await loginAs(page);

        await page.goto(`/subjects/${SUBJECT_ID}`);
        await page.waitForURL(`**/subjects/${SUBJECT_ID}**`, { timeout: 15000 });
        await expect(page.locator('button:has-text("Оценивание")')).toBeVisible({ timeout: 15000 });

        await page.locator('button:has-text("Оценивание")').click();
        await expect(page.locator('h3:has-text("Взаимное оценивание")')).toBeVisible({ timeout: 10000 });

        const peerReviewSection = page.locator('h3:has-text("Взаимное оценивание")').locator('..');
        const toggleRow = peerReviewSection.locator('div.flex.items-center.gap-3').filter({ hasText: 'Взаимное оценивание' });
        await toggleRow.locator('button').click();

        await expect(peerReviewSection.locator('label:has-text("Область оценивания")')).toBeVisible({ timeout: 5000 });

        await peerReviewSection.locator('label:has-text("Область оценивания")').locator('xpath=..').locator('select').selectOption('individual');
        await peerReviewSection.locator('label:has-text("Режим оценивания")').locator('xpath=..').locator('select').selectOption('all_to_all');
        await peerReviewSection.locator('label:has-text("Политика дедлайна")').locator('xpath=..').locator('select').selectOption('task_deadline');
        await peerReviewSection.locator('label:has-text("Политика командного оценивания")').locator('xpath=..').locator('select').selectOption('all_members');

        await page.locator('button:has-text("Сохранить настройки")').click();

        expect(putBody).not.toBeNull();
        expect(putBody!.peerReviewEnabled).toBe(true);
        expect(putBody!.peerReviewScope).toBe('individual');
        expect(putBody!.peerReviewMode).toBe('all_to_all');
        expect(putBody!.peerReviewDeadlinePolicy).toBe('task_deadline');
        expect(putBody!.teamReviewPolicy).toBe('all_members');

        await expect(page.locator('text=Настройки сохранены').first()).toBeVisible({ timeout: 5000 });
    });

    test('1.2 — изменение политики командного оценивания с all_members на captain_only', async ({ page }) => {
        await mockAuthLogin(page);
        await setupSubjectViewMocks(page);

        let putBody: Record<string, unknown> | null = null;

        await page.route(/\/api\/subjects\/[^/?#]+$/, async (route) => {
            if (route.request().method() === 'PUT') {
                putBody = route.request().postDataJSON();
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ id: SUBJECT_ID, title: 'Математика', ...putBody }),
                });
            } else {
                await route.continue();
            }
        });

        await loginAs(page);

        await page.goto(`/subjects/${SUBJECT_ID}`);
        await page.waitForURL(`**/subjects/${SUBJECT_ID}**`, { timeout: 15000 });
        await expect(page.locator('button:has-text("Оценивание")')).toBeVisible({ timeout: 15000 });

        await page.locator('button:has-text("Оценивание")').click();
        await expect(page.locator('h3:has-text("Взаимное оценивание")')).toBeVisible({ timeout: 10000 });

        const peerReviewSection = page.locator('h3:has-text("Взаимное оценивание")').locator('..');
        const toggleRow = peerReviewSection.locator('div.flex.items-center.gap-3').filter({ hasText: 'Взаимное оценивание' });
        await toggleRow.locator('button').click();

        await expect(peerReviewSection.locator('label:has-text("Политика командного оценивания")')).toBeVisible({ timeout: 5000 });

        await peerReviewSection.locator('label:has-text("Политика командного оценивания")').locator('xpath=..').locator('select').selectOption('captain_only');

        await page.locator('button:has-text("Сохранить настройки")').click();

        expect(putBody).not.toBeNull();
        expect(putBody!.teamReviewPolicy).toBe('captain_only');

        await expect(page.locator('text=Настройки сохранены').first()).toBeVisible({ timeout: 5000 });
    });
});
