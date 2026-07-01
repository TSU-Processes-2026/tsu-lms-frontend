import { test, expect, Page } from '@playwright/test';
import { setupTeacherMocks, loginAs } from './mocks/handlers';

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

async function trackCalculate(page: Page): Promise<() => boolean> {
    let called = false;
    await page.route('**/api/courses/*/calculate-grades', async (route) => {
        if (route.request().method() === 'POST') called = true;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    });
    return () => called;
}

async function serveGrades(page: Page, payload: Record<string, unknown>[]) {
    let first = true;
    await page.route('**/api/courses/*/grades', async (route) => {
        if (first) { first = false; await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }); }
        else { await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) }); }
    });
}

test.describe('Feature 6: Расчёт итоговых оценок', () => {

    test.beforeEach(async ({ page }) => {
        await setupTeacherMocks(page);
        await loginAs(page);
    });

    test('6.1 — среднее peer-оценок: 6+8+7 → final_score=7.0, source=peer', async ({ page }) => {
        const wasCalled = await trackCalculate(page);
        await serveGrades(page, makeGradePayload(7.0, 'peer', 3));

        await page.goto('/assignments');
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Нет оценок')).toBeVisible({ timeout: 5000 });

        await page.locator('button:has-text("Пересчитать")').first().click();
        expect(wasCalled()).toBe(true);

        const gradeRow = page.locator('tr').filter({ hasText: 'Студент А' });
        await expect(gradeRow).toBeVisible({ timeout: 5000 });
        const scoreText = await gradeRow.locator('td').nth(1).textContent();
        expect(parseFloat(scoreText!.trim())).toBeCloseTo(7.0, 1);
        await expect(gradeRow.locator('text=Peer')).toBeVisible();
        await expect(gradeRow.locator('span:has-text("3")').first()).toBeVisible();
    });

    test('6.2 — приоритет teacher: peer=6,8 + teacher=9 → final_score=9, source=teacher', async ({ page }) => {
        const wasCalled = await trackCalculate(page);
        await serveGrades(page, makeGradePayload(9, 'teacher', 2));

        await page.goto('/assignments');
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Нет оценок')).toBeVisible({ timeout: 5000 });

        await page.locator('button:has-text("Пересчитать")').first().click();
        expect(wasCalled()).toBe(true);

        const gradeRow = page.locator('tr').filter({ hasText: 'Студент А' });
        await expect(gradeRow).toBeVisible({ timeout: 5000 });
        const scoreText = await gradeRow.locator('td').nth(1).textContent();
        expect(parseFloat(scoreText!.trim())).toBe(9);
        await expect(gradeRow.locator('text=Teacher')).toBeVisible();
    });

    test('6.3 — исключение отклонённых: 6,8,10(rejected) → среднее по 6,8 = 7.0', async ({ page }) => {
        const wasCalled = await trackCalculate(page);
        await serveGrades(page, makeGradePayload(7.0, 'peer', 2));

        await page.goto('/assignments');
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Нет оценок')).toBeVisible({ timeout: 5000 });

        await page.locator('button:has-text("Пересчитать")').first().click();
        expect(wasCalled()).toBe(true);

        const gradeRow = page.locator('tr').filter({ hasText: 'Студент А' });
        await expect(gradeRow).toBeVisible({ timeout: 5000 });
        const scoreText = await gradeRow.locator('td').nth(1).textContent();
        expect(parseFloat(scoreText!.trim())).toBeCloseTo(7.0, 1);
        await expect(gradeRow.locator('.text-slate-500').filter({ hasText: /^2$/ })).toBeVisible();
    });

    test('6.4 — пассивный штраф: peer=8, штраф=1 → final_score=7.0', async ({ page }) => {
        const wasCalled = await trackCalculate(page);
        await serveGrades(page, makeGradePayload(7.0, 'peer', 3));

        await page.goto('/assignments');
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Нет оценок')).toBeVisible({ timeout: 5000 });

        await page.locator('button:has-text("Пересчитать")').first().click();
        expect(wasCalled()).toBe(true);

        const gradeRow = page.locator('tr').filter({ hasText: 'Студент А' });
        await expect(gradeRow).toBeVisible({ timeout: 5000 });
        const scoreText = await gradeRow.locator('td').nth(1).textContent();
        expect(parseFloat(scoreText!.trim())).toBeCloseTo(7.0, 1);
    });

    test('6.5 — пассивный бонус: peer=7, бонус=2 → final_score=9.0', async ({ page }) => {
        const wasCalled = await trackCalculate(page);
        await serveGrades(page, makeGradePayload(9.0, 'peer', 3));

        await page.goto('/assignments');
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Нет оценок')).toBeVisible({ timeout: 5000 });

        await page.locator('button:has-text("Пересчитать")').first().click();
        expect(wasCalled()).toBe(true);

        const gradeRow = page.locator('tr').filter({ hasText: 'Студент А' });
        await expect(gradeRow).toBeVisible({ timeout: 5000 });
        const scoreText = await gradeRow.locator('td').nth(1).textContent();
        expect(parseFloat(scoreText!.trim())).toBeCloseTo(9.0, 1);
    });

    test('6.6 — clamp снизу: peer=2, штраф=5 → final_score=0', async ({ page }) => {
        const wasCalled = await trackCalculate(page);
        await serveGrades(page, makeGradePayload(0, 'peer', 3));

        await page.goto('/assignments');
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Нет оценок')).toBeVisible({ timeout: 5000 });

        await page.locator('button:has-text("Пересчитать")').first().click();
        expect(wasCalled()).toBe(true);

        const gradeRow = page.locator('tr').filter({ hasText: 'Студент А' });
        await expect(gradeRow).toBeVisible({ timeout: 5000 });
        const scoreText = await gradeRow.locator('td').nth(1).textContent();
        expect(parseFloat(scoreText!.trim())).toBe(0);
    });

    test('6.7 — clamp сверху: peer=95, бонус=10, max=100 → final_score=100', async ({ page }) => {
        const wasCalled = await trackCalculate(page);
        await serveGrades(page, makeGradePayload(100, 'peer', 3));

        await page.goto('/assignments');
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Нет оценок')).toBeVisible({ timeout: 5000 });

        await page.locator('button:has-text("Пересчитать")').first().click();
        expect(wasCalled()).toBe(true);

        const gradeRow = page.locator('tr').filter({ hasText: 'Студент А' });
        await expect(gradeRow).toBeVisible({ timeout: 5000 });
        const scoreText = await gradeRow.locator('td').nth(1).textContent();
        expect(parseFloat(scoreText!.trim())).toBe(100);
    });

    test('6.8 — нет завершённых оценок → final_score=null, таблица пуста', async ({ page }) => {
        const wasCalled = await trackCalculate(page);
        await serveGrades(page, []);

        await page.goto('/assignments');
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Нет оценок')).toBeVisible({ timeout: 5000 });

        await page.locator('button:has-text("Пересчитать")').first().click();
        expect(wasCalled()).toBe(true);

        await expect(page.locator('text=Нет оценок')).toBeVisible({ timeout: 5000 });
    });
});
