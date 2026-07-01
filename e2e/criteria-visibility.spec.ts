import { test, expect } from '@playwright/test';
import { mockAuthLogin, loginAs, routeJson } from './mocks/handlers';
import { SUBJECT_ID } from './mocks/fixtures';

test.describe('Сценарии 1.4 и 1.5: Видимость критериев для студента', () => {
    test('1.4 — скрытые критерии: студент видит «Критерии будут доступны позже.»', async ({ page }) => {
        await mockAuthLogin(page, 'student-a');

        await routeJson(page, /\/api\/users\/me/, { id: 'student-a', username: 'Студент А' });
        await routeJson(page, /\/api\/subjects\?/, [{ id: SUBJECT_ID, title: 'Математика' }]);
        await routeJson(page, /\/api\/subjects\/.*\/participants/, [
            { userId: 'teacher-uuid-001', username: 'преподаватель', role: 'teacher' },
            { userId: 'student-a', username: 'Студент А', role: 'student' },
        ]);
        await routeJson(page, /\/api\/subjects\/.*\/roles/, [{ subjectId: SUBJECT_ID, userId: 'student-a', role: 'student' }]);
        await routeJson(page, /\/api\/subjects\/.*\/teams/, { teams: [] });
        await routeJson(page, /\/api\/subjects\/.*\/assignments/, [
            {
                id: 'assignment-task-001',
                subjectId: SUBJECT_ID,
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
        await routeJson(page, /\/api\/assignments\/.*\/submissions/, []);
        await routeJson(page, /\/api\/courses\/.*\/grades/, []);
        await routeJson(page, /\/api\/tasks\/.*\/criteria/, { criteria: [], hidden: true });

        await loginAs(page, 'student-a');
        await page.goto('/assignments');

        await page.locator('button:has-text("Начать выполнение")').first().click();
        await page.waitForTimeout(2000);

        await expect(page.locator('text=Критерии будут доступны позже.')).toBeVisible({ timeout: 5000 });
    });

    test('1.5 — студент видит критерии с форматами и весами', async ({ page }) => {
        await mockAuthLogin(page, 'student-a');

        await routeJson(page, /\/api\/users\/me/, { id: 'student-a', username: 'Студент А' });
        await routeJson(page, /\/api\/subjects\?/, [{ id: SUBJECT_ID, title: 'Математика' }]);
        await routeJson(page, /\/api\/subjects\/.*\/participants/, [
            { userId: 'teacher-uuid-001', username: 'преподаватель', role: 'teacher' },
            { userId: 'student-a', username: 'Студент А', role: 'student' },
        ]);
        await routeJson(page, /\/api\/subjects\/.*\/roles/, [{ subjectId: SUBJECT_ID, userId: 'student-a', role: 'student' }]);
        await routeJson(page, /\/api\/subjects\/.*\/teams/, { teams: [] });
        await routeJson(page, /\/api\/subjects\/.*\/assignments/, [
            {
                id: 'assignment-task-001',
                subjectId: SUBJECT_ID,
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
        await routeJson(page, /\/api\/assignments\/.*\/submissions/, []);
        await routeJson(page, /\/api\/courses\/.*\/grades/, []);

        const visibleCriteria = [
            { id: 'crit-1', taskId: 'assignment-task-001', order: 1, title: 'Качество', description: 'Качество кода', criterionType: 'active', format: 'numeric', appliesTo: 'student', weight: 1.0, maxPoints: 10, isBonus: false, isPenalty: false, isRequired: true },
            { id: 'crit-2', taskId: 'assignment-task-001', order: 2, title: 'Сроки', description: 'Соблюдение сроков', criterionType: 'passive', format: 'checklist', appliesTo: 'student', isBonus: false, isPenalty: true, isRequired: false },
        ];
        await routeJson(page, /\/api\/tasks\/.*\/criteria/, { criteria: visibleCriteria, hidden: false });

        await loginAs(page, 'student-a');
        await page.goto('/assignments');

        await page.locator('button:has-text("Начать выполнение")').first().click();
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
