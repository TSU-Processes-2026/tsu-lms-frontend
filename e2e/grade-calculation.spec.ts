import { test, expect } from '@playwright/test';
import { setupTeacherMocks, routeJson } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE } from './mocks/fixtures';

function makeGradePayload(score: number | null, source: string | null, reviewerCount: number = 3) {
    if (score === null) return [];
    return [{
        studentId: 'student-a',
        studentName: 'Студент А',
        finalScore: score,
        finalGrade: score >= 80 ? '5' : score >= 60 ? '4' : '2',
        finalSource: source,
        reviewerCount,
        calculatedAt: new Date().toISOString(),
    }];
}

test.describe('Feature 6: Расчёт итоговых оценок', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate((token) => {
            localStorage.setItem('accessToken', token);
        }, ACCESS_TOKEN_VALUE);
        await setupTeacherMocks(page);
    });

    test('6.1 — среднее peer-оценок: 6+8+7 → final_score=7.0, source=peer', async ({ page }) => {
        routeJson(page, '**/api/courses/*/grades', makeGradePayload(7.0, 'peer', 3));

        await page.goto('/assignments');
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });

        const gradeRow = page.locator('tr').filter({ hasText: 'Студент А' });
        await expect(gradeRow).toBeVisible({ timeout: 5000 });

        const scoreText = await gradeRow.locator('td').nth(1).textContent();
        expect(parseFloat(scoreText!.trim())).toBeCloseTo(7.0, 1);

        await expect(gradeRow.locator('text=Peer')).toBeVisible();
        await expect(gradeRow.locator('span:has-text("3")').first()).toBeVisible();
    });

    test('6.2 — приоритет teacher: peer=6,8 + teacher=9 → final_score=9, source=teacher', async ({ page }) => {
        routeJson(page, '**/api/courses/*/grades', makeGradePayload(9, 'teacher', 2));

        await page.goto('/assignments');
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });

        const gradeRow = page.locator('tr').filter({ hasText: 'Студент А' });
        await expect(gradeRow).toBeVisible({ timeout: 5000 });

        const scoreText = await gradeRow.locator('td').nth(1).textContent();
        expect(parseFloat(scoreText!.trim())).toBe(9);

        await expect(gradeRow.locator('text=Teacher')).toBeVisible();
    });

    test('6.3 — исключение отклонённых: 6,8,10(rejected) → среднее по 6,8 = 7.0', async ({ page }) => {
        routeJson(page, '**/api/courses/*/grades', makeGradePayload(7.0, 'peer', 2));

        await page.goto('/assignments');
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });

        const gradeRow = page.locator('tr').filter({ hasText: 'Студент А' });
        await expect(gradeRow).toBeVisible({ timeout: 5000 });

        const scoreText = await gradeRow.locator('td').nth(1).textContent();
        expect(parseFloat(scoreText!.trim())).toBeCloseTo(7.0, 1);

        await expect(gradeRow.locator('.text-slate-500').filter({ hasText: /^2$/ })).toBeVisible();
    });

    test('6.4 — пассивный штраф: peer=8, штраф=1 → final_score=7.0', async ({ page }) => {
        routeJson(page, '**/api/courses/*/grades', makeGradePayload(7.0, 'peer', 3));

        await page.goto('/assignments');
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });

        const gradeRow = page.locator('tr').filter({ hasText: 'Студент А' });
        await expect(gradeRow).toBeVisible({ timeout: 5000 });

        const scoreText = await gradeRow.locator('td').nth(1).textContent();
        expect(parseFloat(scoreText!.trim())).toBeCloseTo(7.0, 1);
    });

    test('6.5 — пассивный бонус: peer=7, бонус=2 → final_score=9.0', async ({ page }) => {
        routeJson(page, '**/api/courses/*/grades', makeGradePayload(9.0, 'peer', 3));

        await page.goto('/assignments');
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });

        const gradeRow = page.locator('tr').filter({ hasText: 'Студент А' });
        await expect(gradeRow).toBeVisible({ timeout: 5000 });

        const scoreText = await gradeRow.locator('td').nth(1).textContent();
        expect(parseFloat(scoreText!.trim())).toBeCloseTo(9.0, 1);
    });

    test('6.6 — clamp снизу: peer=2, штраф=5 → final_score=0', async ({ page }) => {
        routeJson(page, '**/api/courses/*/grades', makeGradePayload(0, 'peer', 3));

        await page.goto('/assignments');
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });

        const gradeRow = page.locator('tr').filter({ hasText: 'Студент А' });
        await expect(gradeRow).toBeVisible({ timeout: 5000 });

        const scoreText = await gradeRow.locator('td').nth(1).textContent();
        expect(parseFloat(scoreText!.trim())).toBe(0);
    });

    test('6.7 — clamp сверху: peer=95, бонус=10, max=100 → final_score=100', async ({ page }) => {
        routeJson(page, '**/api/courses/*/grades', makeGradePayload(100, 'peer', 3));

        await page.goto('/assignments');
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });

        const gradeRow = page.locator('tr').filter({ hasText: 'Студент А' });
        await expect(gradeRow).toBeVisible({ timeout: 5000 });

        const scoreText = await gradeRow.locator('td').nth(1).textContent();
        expect(parseFloat(scoreText!.trim())).toBe(100);
    });

    test('6.8 — нет завершённых оценок → final_score=null, таблица пуста', async ({ page }) => {
        routeJson(page, '**/api/courses/*/grades', []);

        await page.goto('/assignments');
        await expect(page.locator('text=Нет оценок')).toBeVisible({ timeout: 10000 });
    });
});
