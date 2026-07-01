import { test, expect } from '@playwright/test';
import { setupTeacherMocks, routeJson } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE, ASSIGNMENT_ID } from './mocks/fixtures';

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

async function callAssignRepresentative(page: import('@playwright/test').Page, teamId: string, userId: string) {
    return page.evaluate(async ({ url, payload, token }) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return { status: res.status, body: await res.json().catch(() => null) };
    }, { url: `${API_BASE}/teams/${teamId}/assign-representative`, payload: { userId }, token: ACCESS_TOKEN_VALUE });
}

test.describe('Feature 4: Командное оценивание', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
        await setupTeacherMocks(page);
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

    test('4.5 — назначение представителя: POST /teams/{id}/assign-representative', async ({ page }) => {
        routeJson(page, '**/api/teams/*/assign-representative', { representativeId: 'student-b' });

        const result = await callAssignRepresentative(page, 'team-x', 'student-b');

        expect(result.status).toBe(200);
        expect(result.body.representativeId).toBe('student-b');
    });
});
