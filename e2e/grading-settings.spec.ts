import { test, expect, Page } from '@playwright/test';
import { setupSubjectViewMocks } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE, SUBJECT_ID } from './mocks/fixtures';

const API_BASE = 'http://localhost:14823/api';

test.describe('Сценарий 1.1: Настройка курса и критериев', () => {

    test('1.1 — преподаватель включает взаимное оценивание и сохраняет через PUT /api/subjects/{id}', async ({ page }) => {
        await setupSubjectViewMocks(page);

        let putBody: Record<string, unknown> | null = null;

        await page.route('**/api/subjects/*', async (route) => {
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

        await page.goto('/');
        await page.evaluate((token) => {
            localStorage.setItem('accessToken', token);
        }, ACCESS_TOKEN_VALUE);

        const result = await page.evaluate(async ({ url, token }) => {
            const res = await fetch(url, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    peerReviewEnabled: true,
                    peerReviewScope: 'individual',
                    peerReviewMode: 'all_to_all',
                    peerReviewDeadlinePolicy: 'task_deadline',
                    teamReviewPolicy: 'all_members',
                }),
            });
            return { status: res.status, body: await res.json() };
        }, { url: `${API_BASE}/subjects/${SUBJECT_ID}`, token: ACCESS_TOKEN_VALUE });

        expect(result.status).toBe(200);
        expect(result.body.peerReviewEnabled).toBe(true);
        expect(result.body.peerReviewScope).toBe('individual');
        expect(result.body.peerReviewMode).toBe('all_to_all');
        expect(result.body.peerReviewDeadlinePolicy).toBe('task_deadline');
        expect(result.body.teamReviewPolicy).toBe('all_members');
    });
});
