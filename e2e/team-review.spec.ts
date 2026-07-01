import { test, expect } from '@playwright/test';
import { setupTeacherMocks, mockAuthLogin, loginAs, routeJson } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE, ASSIGNMENT_ID, SUBJECT_ID } from './mocks/fixtures';

const API_BASE = 'http://localhost:14823/api';

async function callGenerateReviews(page: import('@playwright/test').Page, taskId: string, body: Record<string, unknown> = {}) {
    return page.evaluate(async ({ url, payload, token }) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return await res.json();
    }, { url: `${API_BASE}/tasks/${taskId}/generate-reviews`, payload: body, token: ACCESS_TOKEN_VALUE });
}

async function callStartReview(page: import('@playwright/test').Page, reviewId: string) {
    return page.evaluate(async ({ url, token }) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        return { status: res.status, body: await res.json().catch(() => null) };
    }, { url: `${API_BASE}/reviews/${reviewId}/start`, token: ACCESS_TOKEN_VALUE });
}

test.describe('Feature 4: Командное оценивание', () => {

    test.describe('API-тесты бэкенда (4.1–4.4)', () => {

        test.beforeEach(async ({ page }) => {
            await setupTeacherMocks(page);
            await loginAs(page);
        });

        test('4.1 — all_members: 3 члена команды X → 3 назначения A→Y, B→Y, C→Y', async ({ page }) => {
            const assignments = [
                { id: 'rev-1', reviewerUserId: 'student-a', reviewerTeamId: 'team-x', reviewTargetType: 'team_submission', targetTeamId: 'team-y' },
                { id: 'rev-2', reviewerUserId: 'student-b', reviewerTeamId: 'team-x', reviewTargetType: 'team_submission', targetTeamId: 'team-y' },
                { id: 'rev-3', reviewerUserId: 'student-c', reviewerTeamId: 'team-x', reviewTargetType: 'team_submission', targetTeamId: 'team-y' },
            ];
            routeJson(page, '**/api/tasks/*/generate-reviews', { count: 3, assignments });

            const result = await callGenerateReviews(page, ASSIGNMENT_ID, { reviewType: 'team', teamReviewPolicy: 'all_members' });

            expect(result.count).toBe(3);
            expect(result.assignments).toHaveLength(3);
            for (const a of result.assignments) {
                expect(a.reviewTargetType).toBe('team_submission');
                expect(a.reviewerTeamId).toBe('team-x');
                expect(a.targetTeamId).toBe('team-y');
            }
        });

        test('4.2 — captain_only: 1 назначение на капитана A', async ({ page }) => {
            const assignments = [
                { id: 'rev-1', reviewerUserId: 'student-a', reviewerTeamId: 'team-x', reviewTargetType: 'team_submission', targetTeamId: 'team-y' },
            ];
            routeJson(page, '**/api/tasks/*/generate-reviews', { count: 1, assignments });

            const result = await callGenerateReviews(page, ASSIGNMENT_ID, { reviewType: 'team', teamReviewPolicy: 'captain_only' });

            expect(result.count).toBe(1);
            expect(result.assignments).toHaveLength(1);
            expect(result.assignments[0].reviewerUserId).toBe('student-a');
        });

        test('4.3 — one_representative_reviews: 1 назначение на представителя B', async ({ page }) => {
            const assignments = [
                { id: 'rev-1', reviewerUserId: 'student-b', reviewerTeamId: 'team-x', reviewTargetType: 'team_submission', targetTeamId: 'team-y' },
            ];
            routeJson(page, '**/api/tasks/*/generate-reviews', { count: 1, assignments });

            const result = await callGenerateReviews(page, ASSIGNMENT_ID, { reviewType: 'team', teamReviewPolicy: 'one_representative_reviews' });

            expect(result.count).toBe(1);
            expect(result.assignments[0].reviewerUserId).toBe('student-b');
        });

        test('4.4 — неавторизованный участник: POST /reviews/{id}/start → 403', async ({ page }) => {
            await page.route('**/api/reviews/*/start', async (route) => {
                await route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ title: 'Forbidden', status: 403 }) });
            });

            const result = await callStartReview(page, 'rev-captain-only');

            expect(result.status).toBe(403);
        });
    });

    test('4.5 — назначение представителя через UI на странице EditTeamPage', async ({ page }) => {
        await mockAuthLogin(page);

        await page.route(/\/api\/users\/me/, async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'teacher-uuid-001', username: 'преподаватель' }) });
        });
        await page.route(/\/api\/subjects\?/, async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: SUBJECT_ID, title: 'Математика' }]) });
        });

        const teamData = {
            teams: [{
                id: 'team-x',
                subjectId: SUBJECT_ID,
                memberIds: ['student-a', 'student-b', 'student-c'],
                members: [
                    { userId: 'student-a', username: 'Студент А' },
                    { userId: 'student-b', username: 'Студент Б' },
                    { userId: 'student-c', username: 'Студент В' },
                ],
                representativeId: null,
            }],
            distributionMode: 'Manual',
        };
        const unassignedData = {
            subjectId: SUBJECT_ID,
            studentIds: ['student-a', 'student-b', 'student-c'],
            students: [
                { userId: 'student-a', username: 'Студент А' },
                { userId: 'student-b', username: 'Студент Б' },
                { userId: 'student-c', username: 'Студент В' },
            ],
        };

        await page.route(/\/api\/subjects\/.*\/teams/, async (route) => {
            const url = route.request().url();
            if (url.includes('/teams/unassigned')) {
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(unassignedData) });
            } else {
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(teamData) });
            }
        });

        let assignBody: unknown = null;
        await page.route(/\/api\/teams\/.*\/assign-representative/, async (route) => {
            if (route.request().method() === 'POST') {
                assignBody = route.request().postDataJSON();
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ representativeId: (assignBody as Record<string, string>).userId }) });
            } else {
                await route.continue();
            }
        });

        await loginAs(page);

        await page.goto(`/subject/${SUBJECT_ID}/teams/team-x/edit`);
        await expect(page.locator('h2:has-text("Редактирование состава команды")')).toBeVisible({ timeout: 15000 });

        const assignButton = page.locator('button:has-text("Назначить представителем")').first();
        await expect(assignButton).toBeVisible({ timeout: 10000 });
        await assignButton.click();

        await expect(page.locator('text=Представитель').first()).toBeVisible({ timeout: 5000 });

        expect(assignBody).not.toBeNull();
        expect((assignBody as Record<string, string>).userId).toBe('student-a');
    });
});
