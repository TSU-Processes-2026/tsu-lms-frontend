import { test, expect, Page } from '@playwright/test';
import { setupTeacherMocks } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE } from './mocks/fixtures';

function routeJson(page: Page, url: string | RegExp, data: unknown, status = 200) {
    return page.route(url, async (route) => {
        await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
    });
}

test.describe('Сценарии 1.4 и 1.5: Видимость критериев', () => {

    test('1.4 — скрытые критерии: студент видит «Критерии будут доступны позже.»', async ({ page }) => {
        routeJson(page, /\/api\/users\/me/, { id: 'student-a', username: 'Студент А' });
        routeJson(page, /\/api\/subjects\?/, [{ id: 'subject-math-101', title: 'Математика' }]);
        routeJson(page, /\/api\/subjects\/.*\/participants/, [
            { userId: 'teacher-uuid-001', username: 'преподаватель', role: 'teacher' },
            { userId: 'student-a', username: 'Студент А', role: 'student' },
        ]);
        routeJson(page, /\/api\/subjects\/.*\/roles/, [{ subjectId: 'subject-math-101', userId: 'student-a', role: 'student' }]);
        routeJson(page, /\/api\/subjects\/.*\/teams/, { teams: [] });
        routeJson(page, /\/api\/subjects\/.*\/assignments/, [
            {
                id: 'assignment-task-001',
                subjectId: 'subject-math-101',
                authorId: 'teacher-uuid-001',
                postType: 'Assignment',
                content: 'Домашнее задание №1\nРешить задачи.',
                createdAt: '2026-06-01T10:00:00Z',
                assignmentData: JSON.stringify({ self_assessment_enabled: true, max_points: 10, self_assessment_visibility_date: '2099-12-31T12:00:00Z' }),
                maxPoints: 10,
                selfAssessmentEnabled: true,
                deadLine: '2026-07-15T23:59:00Z',
                questions: [],
            },
        ]);
        routeJson(page, /\/api\/assignments\/.*\/submissions/, []);
        routeJson(page, /\/api\/courses\/.*\/grades/, []);
        routeJson(page, /\/api\/tasks\/.*\/criteria/, { criteria: [], hidden: true });

        await page.goto('/');
        await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);

        await page.goto('/assignments');

        const openButton = page.locator('button:has-text("Начать выполнение")').first();
        await expect(openButton).toBeVisible({ timeout: 10000 });
        await openButton.click();

        await page.waitForTimeout(2000);

        const hiddenMessage = page.locator('text=Критерии будут доступны позже.');
        await expect(hiddenMessage).toBeVisible({ timeout: 5000 });
    });

    test('1.5 — студент видит критерии с форматами и весами', async ({ page }) => {
        routeJson(page, /\/api\/users\/me/, { id: 'student-a', username: 'Студент А' });
        routeJson(page, /\/api\/subjects\?/, [{ id: 'subject-math-101', title: 'Математика' }]);
        routeJson(page, /\/api\/subjects\/.*\/participants/, [
            { userId: 'teacher-uuid-001', username: 'преподаватель', role: 'teacher' },
            { userId: 'student-a', username: 'Студент А', role: 'student' },
        ]);
        routeJson(page, /\/api\/subjects\/.*\/roles/, [{ subjectId: 'subject-math-101', userId: 'student-a', role: 'student' }]);
        routeJson(page, /\/api\/subjects\/.*\/teams/, { teams: [] });
        routeJson(page, /\/api\/subjects\/.*\/assignments/, [
            {
                id: 'assignment-task-001',
                subjectId: 'subject-math-101',
                authorId: 'teacher-uuid-001',
                postType: 'Assignment',
                content: 'Домашнее задание №1\nРешить задачи.',
                createdAt: '2026-06-01T10:00:00Z',
                assignmentData: JSON.stringify({ self_assessment_enabled: true, max_points: 10, self_assessment_visibility_date: '2020-01-01T10:00:00Z' }),
                maxPoints: 10,
                selfAssessmentEnabled: true,
                deadLine: '2026-07-15T23:59:00Z',
                questions: [],
            },
        ]);
        routeJson(page, /\/api\/assignments\/.*\/submissions/, []);
        routeJson(page, /\/api\/courses\/.*\/grades/, []);

        const visibleCriteria = [
            { id: 'crit-1', taskId: 'assignment-task-001', order: 1, title: 'Качество', description: 'Качество кода', criterionType: 'active', format: 'numeric', appliesTo: 'student', weight: 1.0, maxPoints: 10, isBonus: false, isPenalty: false, isRequired: true },
            { id: 'crit-2', taskId: 'assignment-task-001', order: 2, title: 'Сроки', description: 'Соблюдение сроков', criterionType: 'passive', format: 'checklist', appliesTo: 'student', isBonus: false, isPenalty: true, isRequired: false },
        ];
        routeJson(page, /\/api\/tasks\/.*\/criteria/, { criteria: visibleCriteria, hidden: false });

        await page.goto('/');
        await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);

        await page.goto('/assignments');

        const openButton = page.locator('button:has-text("Начать выполнение")').first();
        await expect(openButton).toBeVisible({ timeout: 10000 });
        await openButton.click();

        await page.waitForTimeout(2000);

        await expect(page.locator('text=Качество кода').first()).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=Соблюдение сроков').first()).toBeVisible();
        await expect(page.locator('text=Активный').first()).toBeVisible();
        await expect(page.locator('text=Пассивный').first()).toBeVisible();
        await expect(page.locator('text=Число').first()).toBeVisible();
        await expect(page.locator('text=Чеклист').first()).toBeVisible();
        await expect(page.locator('text=Макс. балл: 10')).toBeVisible();
        await expect(page.locator('text=Штраф').first()).toBeVisible();
        await expect(page.locator('text=Обязательный').first()).toBeVisible();
    });
});
