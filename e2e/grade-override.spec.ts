import { test, expect } from '@playwright/test';
import { setupTeacherMocks, loginAs } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE } from './mocks/fixtures';

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

function makeGradeRow(score: number, source: string, reviewerCount = 3) {
    return [{
        studentId: 'student-a', studentName: 'Студент А',
        finalScore: score,
        finalGrade: score >= 80 ? '5' : score >= 60 ? '4' : '2',
        finalSource: source, reviewerCount,
        calculatedAt: new Date().toISOString(),
    }];
}

async function serveGrades(page: import('@playwright/test').Page, payload: Record<string, unknown>[]) {
    let first = true;
    await page.route('**/api/courses/*/grades', async (route) => {
        if (first) { first = false; await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }); }
        else { await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) }); }
    });
}

test.describe('Teacher Evaluation Options (Grade Override)', () => {

    test('Teacher accepts peer grades — shows Peer badge', async ({ page }) => {
        await setupTeacherMocks(page);
        await loginAs(page);
        await serveGrades(page, makeGradeRow(7.5, 'peer', 3));

        await page.goto('/assignments');
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });
        await page.locator('button:has-text("Пересчитать")').first().click();
        await page.waitForTimeout(1500);

        const gradeRow = page.locator('tr').filter({ hasText: 'Студент А' });
        await expect(gradeRow).toBeVisible({ timeout: 5000 });
        await expect(gradeRow.locator('.bg-emerald-100')).toContainText('Peer');
        await expect(gradeRow.locator('td').nth(1)).toContainText('7.50');
    });

    test('Teacher overrides — shows Teacher badge with different score', async ({ page }) => {
        await setupTeacherMocks(page);
        await loginAs(page);
        await serveGrades(page, makeGradeRow(9, 'teacher', 2));

        await page.goto('/assignments');
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });
        await page.locator('button:has-text("Пересчитать")').first().click();
        await page.waitForTimeout(1500);

        const gradeRow = page.locator('tr').filter({ hasText: 'Студент А' });
        await expect(gradeRow).toBeVisible({ timeout: 5000 });
        await expect(gradeRow.locator('.bg-blue-100')).toContainText('Teacher');
        await expect(gradeRow.locator('td').nth(1)).toContainText('9.00');
    });

    test('Mixed source — shows Mixed badge', async ({ page }) => {
        await setupTeacherMocks(page);
        await loginAs(page);
        await serveGrades(page, makeGradeRow(8, 'mixed', 4));

        await page.goto('/assignments');
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });
        await page.locator('button:has-text("Пересчитать")').first().click();
        await page.waitForTimeout(1500);

        const gradeRow = page.locator('tr').filter({ hasText: 'Студент А' });
        await expect(gradeRow).toBeVisible({ timeout: 5000 });
        await expect(gradeRow.locator('.bg-purple-100')).toContainText('Mixed');
    });

    test('GradeOverrideModal API — POST final-grade returns success', async ({ page }) => {
        await setupTeacherMocks(page);
        await loginAs(page);

        await page.route('**/api/submissions/*/final-grade', async (route) => {
            if (route.request().method() === 'POST') {
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ finalScore: 8, finalSource: 'teacher' }) });
            } else {
                await route.continue();
            }
        });

        const result = await callApi(page, 'POST', '/submissions/sub-test-1/final-grade', { finalScore: 8, finalSource: 'teacher' });
        expect(result.status).toBe(200);
        expect(result.body.finalSource).toBe('teacher');
        expect(result.body.finalScore).toBe(8);
    });
});
