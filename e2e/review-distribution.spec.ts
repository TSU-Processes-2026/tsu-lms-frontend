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

test.describe('Feature 2: Распределение проверок', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
        await setupTeacherMocks(page);
    });

    test('2.1 — all-to-all: 3 студента → 6 назначений, без self-review', async ({ page }) => {
        const assignments = [
            { id: 'rev-1', reviewerUserId: 'student-a', authorId: 'student-b' },
            { id: 'rev-2', reviewerUserId: 'student-a', authorId: 'student-c' },
            { id: 'rev-3', reviewerUserId: 'student-b', authorId: 'student-a' },
            { id: 'rev-4', reviewerUserId: 'student-b', authorId: 'student-c' },
            { id: 'rev-5', reviewerUserId: 'student-c', authorId: 'student-a' },
            { id: 'rev-6', reviewerUserId: 'student-c', authorId: 'student-b' },
        ];
        routeJson(page, '**/api/tasks/*/generate-reviews', { count: 6, assignments });

        const result = await callGenerateReviews(page, ASSIGNMENT_ID, { mode: 'all_to_all' });

        expect(result.count).toBe(6);
        expect(result.assignments).toHaveLength(6);
        for (const a of result.assignments) {
            expect(a.reviewerUserId).not.toBe(a.authorId);
        }
    });

    test('2.2 — pairs: 4 студента → циркулярная цепочка из 4 назначений', async ({ page }) => {
        const assignments = [
            { id: 'rev-1', reviewerUserId: 'student-a', authorId: 'student-b' },
            { id: 'rev-2', reviewerUserId: 'student-b', authorId: 'student-c' },
            { id: 'rev-3', reviewerUserId: 'student-c', authorId: 'student-d' },
            { id: 'rev-4', reviewerUserId: 'student-d', authorId: 'student-a' },
        ];
        routeJson(page, '**/api/tasks/*/generate-reviews', { count: 4, assignments });

        const result = await callGenerateReviews(page, ASSIGNMENT_ID, { mode: 'pairs' });

        expect(result.count).toBe(4);
        expect(result.assignments).toHaveLength(4);
        expect(result.assignments[0].reviewerUserId).toBe('student-a');
        expect(result.assignments[0].authorId).toBe('student-b');
        expect(result.assignments[3].reviewerUserId).toBe('student-d');
        expect(result.assignments[3].authorId).toBe('student-a');
    });

    test('2.3 — pairs: 3 студента → триплет из 3 назначений', async ({ page }) => {
        const assignments = [
            { id: 'rev-1', reviewerUserId: 'student-a', authorId: 'student-b' },
            { id: 'rev-2', reviewerUserId: 'student-b', authorId: 'student-c' },
            { id: 'rev-3', reviewerUserId: 'student-c', authorId: 'student-a' },
        ];
        routeJson(page, '**/api/tasks/*/generate-reviews', { count: 3, assignments });

        const result = await callGenerateReviews(page, ASSIGNMENT_ID, { mode: 'pairs' });

        expect(result.count).toBe(3);
        expect(result.assignments).toHaveLength(3);
    });

    test('2.4 — повторная генерация: "Assignments already exist"', async ({ page }) => {
        routeJson(page, '**/api/tasks/*/generate-reviews', { count: 0, message: 'Assignments already exist' });

        const result = await callGenerateReviews(page, ASSIGNMENT_ID);

        expect(result.count).toBe(0);
        expect(result.message).toBe('Assignments already exist');
    });

    test('2.5 — назначение с дедлайном: due_at = review_deadline_at, status = pending', async ({ page }) => {
        const dueAt = '2026-06-28T23:59:00Z';
        const assignments = [
            { id: 'rev-1', reviewerUserId: 'student-a', authorId: 'student-b', dueAt, status: 'pending' },
            { id: 'rev-2', reviewerUserId: 'student-b', authorId: 'student-a', dueAt, status: 'pending' },
        ];
        routeJson(page, '**/api/tasks/*/generate-reviews', { count: 2, assignments });

        const result = await callGenerateReviews(page, ASSIGNMENT_ID);

        expect(result.count).toBe(2);
        for (const a of result.assignments) {
            expect(a.dueAt).toBe(dueAt);
            expect(a.status).toBe('pending');
        }
    });
});
