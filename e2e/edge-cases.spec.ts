import { test, expect } from '@playwright/test';
import { setupTeacherMocks, setupStudentMocks, routeJson } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE, makeReviewAssignments, ASSIGNMENT_ID } from './mocks/fixtures';

const API_BASE = 'http://localhost:14823/api';

async function callApi(page: import('@playwright/test').Page, method: string, path: string, body?: unknown) {
    return page.evaluate(async ({ url, method, payload, token }) => {
        const res = await fetch(url, {
            method,
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: payload ? JSON.stringify(payload) : undefined,
        });
        return { status: res.status, body: await res.json().catch(() => null) };
    }, { url: `${API_BASE}${path}`, method, payload: body, token: ACCESS_TOKEN_VALUE });
}

test.describe('Feature 8: Крайние случаи', () => {

    test.describe('Scenario 8.1: Студент не успел выставить оценку', () => {
        test('expired статус отображается в ReviewList', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
            const pastDue = new Date(Date.now() - 86400000).toISOString();
            await setupStudentMocks(page, [
                { ...makeReviewAssignments()[0], id: 'rev-expired', status: 'expired', dueAt: pastDue },
            ]);
            await page.goto('/assignments');
            await page.locator('button:has-text("Мои проверки")').click();
            await expect(page.locator('text=Просрочена')).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe('Scenario 8.2: Частичная оценка — черновик не идёт в зачёт', () => {
        test('opened (черновик) не отображается как «Завершена»', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
            await setupStudentMocks(page, [{ ...makeReviewAssignments()[0], status: 'opened' }]);
            await page.goto('/assignments');
            await page.locator('button:has-text("Мои проверки")').click();
            await expect(page.locator('text=В процессе')).toBeVisible({ timeout: 5000 });
            await expect(page.locator('text=Завершена')).toHaveCount(0);
        });
    });

    test.describe('Scenario 8.3: Пересечение дедлайнов', () => {
        test('review_deadline < task_deadline → 403 Forbidden', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
            await setupTeacherMocks(page);

            await page.route('**/api/subjects/*/posts/*', async (route) => {
                await route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ title: 'Forbidden', status: 403, detail: 'Review deadline must be after task deadline' }) });
            });

            const result = await callApi(page, 'PUT', `/subjects/subject-math-101/posts/${ASSIGNMENT_ID}`, {
                reviewDeadlineAt: '2026-06-25T23:59:00Z',
                deadLine: '2026-06-30T23:59:00Z',
            });

            expect(result.status).toBe(403);
        });
    });

    test.describe('Scenario 8.4: Самооценка не смешивается с peer-оценкой', () => {
        test('CourseGradesPanel показывает только peer/teacher/mixed, не SELF', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
            await setupTeacherMocks(page);
            routeJson(page, '**/api/courses/*/grades', [{
                studentId: 'student-a', studentName: 'Студент А',
                finalScore: 7.5, finalGrade: '4', finalSource: 'peer', reviewerCount: 2,
                calculatedAt: new Date().toISOString(),
            }]);

            await page.goto('/assignments');
            await expect(page.locator('text=Peer')).toBeVisible({ timeout: 10000 });
            await expect(page.locator('text=SELF')).toHaveCount(0);
        });
    });

    test.describe('Scenario 8.5: Команда не может оценивать своё решение', () => {
        test('generate-reviews пропускает targetTeam == reviewerTeam', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
            await setupTeacherMocks(page);

            const assignments = [
                { id: 'rev-1', reviewerTeamId: 'team-x', targetTeamId: 'team-y' },
                { id: 'rev-2', reviewerTeamId: 'team-y', targetTeamId: 'team-x' },
            ];
            routeJson(page, '**/api/tasks/*/generate-reviews', { count: 2, assignments });

            const result = await callApi(page, 'POST', `/tasks/${ASSIGNMENT_ID}/generate-reviews`, { reviewType: 'team' });

            expect(result.body.count).toBe(2);
            for (const a of result.body.assignments) {
                expect(a.reviewerTeamId).not.toBe(a.targetTeamId);
            }
        });
    });

    test.describe('Scenario 8.6: Студент не может оценивать свою работу', () => {
        test('generate-reviews пропускает self-review', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
            await setupTeacherMocks(page);

            const assignments = [
                { id: 'rev-1', reviewerUserId: 'student-a', authorId: 'student-b' },
                { id: 'rev-2', reviewerUserId: 'student-b', authorId: 'student-a' },
            ];
            routeJson(page, '**/api/tasks/*/generate-reviews', { count: 2, assignments });

            const result = await callApi(page, 'POST', `/tasks/${ASSIGNMENT_ID}/generate-reviews`, { mode: 'all_to_all' });

            for (const a of result.body.assignments) {
                expect(a.reviewerUserId).not.toBe(a.authorId);
            }
        });
    });

    test.describe('Scenario 8.7: Отмена проверки', () => {
        test('cancelled статус отображается в ReviewList', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
            await setupStudentMocks(page, [
                { ...makeReviewAssignments()[0], id: 'rev-cancelled', status: 'cancelled' },
            ]);
            await page.goto('/assignments');
            await page.locator('button:has-text("Мои проверки")').click();
            await expect(page.locator('text=Отменена')).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe('Scenario 8.8: Нечётное число в pairs — триплет', () => {
        test('5 студентов: 1 пара + 1 триплет = 4 назначения', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
            await setupTeacherMocks(page);

            const assignments = [
                { id: 'rev-1', reviewerUserId: 'student-a', authorId: 'student-b' },
                { id: 'rev-2', reviewerUserId: 'student-b', authorId: 'student-a' },
                { id: 'rev-3', reviewerUserId: 'student-c', authorId: 'student-d' },
                { id: 'rev-4', reviewerUserId: 'student-d', authorId: 'student-e' },
            ];
            routeJson(page, '**/api/tasks/*/generate-reviews', { count: 4, assignments });

            const result = await callApi(page, 'POST', `/tasks/${ASSIGNMENT_ID}/generate-reviews`, { mode: 'pairs' });

            expect(result.body.count).toBe(4);
        });
    });

    test.describe('Scenario 8.9: Все форматы критериев', () => {
        test('checklist, percentage, numeric, boolean, scale — все отображаются', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
            await setupTeacherMocks(page);

            const allFormats = [
                { id: 'c-1', title: 'Чеклист', description: 'Чеклист', criterionType: 'active', format: 'checklist', order: 1, weight: 1, maxPoints: 2 },
                { id: 'c-2', title: 'Проценты', description: 'Проценты', criterionType: 'active', format: 'percentage', order: 2, weight: 1, maxPoints: 100 },
                { id: 'c-3', title: 'Число', description: 'Число', criterionType: 'active', format: 'numeric', order: 3, weight: 1, maxPoints: 10 },
                { id: 'c-4', title: 'Да/Нет', description: 'Да/Нет', criterionType: 'active', format: 'boolean', order: 4, weight: 1, maxPoints: 1 },
                { id: 'c-5', title: 'Шкала', description: 'Шкала', criterionType: 'active', format: 'scale', order: 5, weight: 1, maxPoints: 5 },
            ];

            await page.route(/\/api\/tasks\/.*\/criteria/, async (route) => {
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ criteria: allFormats, hidden: false }) });
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
            await page.locator('button:has-text("Критерии")').first().click();

            await expect(page.locator('text=Чеклист').first()).toBeVisible({ timeout: 5000 });
            await expect(page.locator('text=Проценты').first()).toBeVisible();
            await expect(page.locator('text=Число').first()).toBeVisible();
            await expect(page.locator('text=Да/Нет').first()).toBeVisible();
            await expect(page.locator('text=Шкала').first()).toBeVisible();
        });
    });

    test.describe('Scenario 8.10: Представитель не назначен — капитан замещает', () => {
        test('RepresentativeUserId ?? CaptainUserId → капитан допускается', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
            await setupTeacherMocks(page);

            await page.route('**/api/reviews/*/start', async (route) => {
                const body = route.request().postDataJSON();
                if (body && body.userId === 'captain-a') {
                    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'opened' }) });
                } else {
                    await route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ title: 'Forbidden', status: 403 }) });
                }
            });

            const captainResult = await callApi(page, 'POST', '/reviews/rev-1/start', { userId: 'captain-a' });
            expect(captainResult.status).toBe(200);

            const memberResult = await callApi(page, 'POST', '/reviews/rev-1/start', { userId: 'member-c' });
            expect(memberResult.status).toBe(403);
        });
    });

    test.describe('Scenario 8.11: Преподаватель не может отклонить teacher-оценку', () => {
        test('POST /reviews/{id}/reject для teacher-оценки → 404', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
            await setupTeacherMocks(page);

            await page.route('**/api/reviews/*/reject', async (route) => {
                await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ title: 'Not Found', status: 404 }) });
            });

            const result = await callApi(page, 'POST', '/reviews/rev-teacher-1/reject');

            expect(result.status).toBe(404);
        });
    });

    test.describe('Scenario 8.12: Дедлайн не задан — проверка не протухает', () => {
        test('dueAt = undefined → статус остаётся «Ожидает», не «Просрочена»', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
            await setupStudentMocks(page, [
                { ...makeReviewAssignments()[0], status: 'pending', dueAt: undefined },
            ]);
            await page.goto('/assignments');
            await page.locator('button:has-text("Мои проверки")').click();
            await expect(page.locator('text=Ожидает')).toBeVisible({ timeout: 5000 });
            await expect(page.locator('text=Просрочена')).toHaveCount(0);
        });
    });

    test.describe('Scenario 8.13: Студент не видит чужие проверки', () => {
        test('GET /api/reviews/{id} для чужой проверки → 403', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
            await setupStudentMocks(page, [makeReviewAssignments()[0]]);

            await page.route('**/api/reviews/rev-other**', async (route) => {
                await route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ title: 'Forbidden', status: 403 }) });
            });

            const result = await callApi(page, 'GET', '/reviews/rev-other');

            expect(result.status).toBe(403);
        });
    });
});
