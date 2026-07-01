import { test, expect } from '@playwright/test';
import { mockAuthLogin, loginAs, routeJson } from './mocks/handlers';
import { SUBJECT_ID } from './mocks/fixtures';

test.describe('Feature 1: Настройка критериев', () => {
    let createdAssignmentId: string;

    test.beforeAll(async () => {
        createdAssignmentId = `assignment-new-${Date.now()}`;
    });

    test.beforeEach(async ({ page }) => {
        await mockAuthLogin(page);

        await page.route('**/api/users/me', async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'teacher-uuid-001', username: 'преподаватель' }) });
        });

        await page.route(/\/api\/subjects(\?|$)/, async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: SUBJECT_ID, title: 'Математика' }]) });
        });

        await page.route(/\/api\/subjects\/.*\/roles/, async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ subjectId: SUBJECT_ID, userId: 'teacher-uuid-001', role: 'teacher' }]) });
        });

        await page.route(/\/api\/subjects\/.*\/participants/, async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
                { userId: 'teacher-uuid-001', username: 'преподаватель', role: 'teacher' },
                { userId: 'student-a', username: 'Студент А', role: 'student' },
            ]) });
        });

        await page.route(/\/api\/subjects\/.*\/teams/, async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ teams: [] }) });
        });

        await page.route(/\/api\/subjects\/.*\/assignments/, async (route) => {
            if (route.request().method() === 'POST') {
                const body = route.request().postDataJSON();
                const newAssign = {
                    id: createdAssignmentId,
                    subjectId: SUBJECT_ID,
                    authorId: 'teacher-uuid-001',
                    postType: 'Assignment',
                    content: body?.content || 'Новое задание',
                    createdAt: new Date().toISOString(),
                    assignmentData: JSON.stringify({ max_points: 10 }),
                    maxPoints: 10,
                    selfAssessmentEnabled: false,
                    deadLine: '2026-07-15T23:59:00Z',
                    questions: [],
                };
                await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(newAssign) });
            } else {
                await route.fulfill({
                    status: 200, contentType: 'application/json',
                    body: JSON.stringify([{
                        id: createdAssignmentId,
                        subjectId: SUBJECT_ID,
                        authorId: 'teacher-uuid-001',
                        postType: 'Assignment',
                        content: 'Новое задание\nСоздано через E2E тест',
                        createdAt: new Date().toISOString(),
                        assignmentData: JSON.stringify({ max_points: 10 }),
                        maxPoints: 10,
                        selfAssessmentEnabled: false,
                        deadLine: '2026-07-15T23:59:00Z',
                        questions: [],
                    }]),
                });
            }
        });

        await page.route(/\/api\/assignments\/.*\/submissions/, async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
        });

        await page.route(/\/api\/courses\/.*\/grades/, async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
        });

        await page.route(/\/api\/courses\/.*\/analytics/, async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ courseId: SUBJECT_ID, taskTitles: [], rows: [] }) });
        });

        await page.route(/\/api\/courses\/.*\/calculate-grades/, async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
        });

        await loginAs(page);
    });

    test('1.2 — преподаватель логинится, создаёт задание, добавляет активный критерий с проверкой POST-тела', async ({ page }) => {
        await page.goto('/assignments');
        await expect(page.locator('text=Новое задание')).toBeVisible({ timeout: 10000 });

        await page.locator('button:has-text("Критерии")').first().click();
        await expect(page.locator('text=Критерии задания')).toBeVisible({ timeout: 5000 });
        await page.locator('button:has-text("Добавить критерий")').click();

        let postBody: Record<string, unknown> | null = null;
        const stored: unknown[] = [];

        await page.route('**/api/tasks/*/criteria', async (route) => {
            if (route.request().method() === 'POST') {
                postBody = route.request().postDataJSON();
                const item = { id: 'crit-1', taskId: createdAssignmentId, order: 1, ...postBody };
                stored.push(item);
                await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(item) });
            } else if (route.request().method() === 'GET') {
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ criteria: stored, hidden: false }) });
            } else {
                await route.continue();
            }
        });

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
        expect((postBody as Record<string, unknown>).appliesTo).toBe('student');
        expect((postBody as Record<string, unknown>).isBonus).toBe(false);
        expect((postBody as Record<string, unknown>).isPenalty).toBe(false);
        expect((postBody as Record<string, unknown>).isRequired).toBe(false);
        expect((postBody as Record<string, unknown>).isHiddenUntilVisibility).toBe(false);
    });

    test('1.3 — преподаватель создаёт пассивный штрафной критерий с проверкой isPenalty', async ({ page }) => {
        await page.goto('/assignments');
        await expect(page.locator('text=Новое задание')).toBeVisible({ timeout: 10000 });

        await page.locator('button:has-text("Критерии")').first().click();
        await expect(page.locator('text=Критерии задания')).toBeVisible({ timeout: 5000 });
        await page.locator('button:has-text("Добавить критерий")').click();

        let postBody: Record<string, unknown> | null = null;
        const stored: unknown[] = [];

        await page.route('**/api/tasks/*/criteria', async (route) => {
            if (route.request().method() === 'POST') {
                postBody = route.request().postDataJSON();
                const item = { id: 'crit-1', taskId: createdAssignmentId, order: 1, ...postBody };
                stored.push(item);
                await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(item) });
            } else if (route.request().method() === 'GET') {
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ criteria: stored, hidden: false }) });
            } else {
                await route.continue();
            }
        });

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
        expect((postBody as Record<string, unknown>).isBonus).toBe(false);
        expect((postBody as Record<string, unknown>).isRequired).toBe(false);
        expect((postBody as Record<string, unknown>).isHiddenUntilVisibility).toBe(false);
    });
});
