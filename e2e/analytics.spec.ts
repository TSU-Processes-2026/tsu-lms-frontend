import { test, expect } from '@playwright/test';
import { setupTeacherMocks, routeJson } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE, SUBJECT_ID, ASSIGNMENT_ID } from './mocks/fixtures';

test.describe('Сценарии 7.1–7.4: Аналитика и экспорт', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
        await setupTeacherMocks(page);
    });

    test('7.1 — таблица: Peer-зелёный, Teacher-синий, Mixed-фиолетовый', async ({ page }) => {
        routeJson(page, '**/api/courses/*/analytics', {
            courseId: SUBJECT_ID,
            taskTitles: ['Задача 1', 'Задача 2', 'Задача 3'],
            rows: [
                {
                    studentId: 's1', studentName: 'Анна',
                    taskGrades: [
                        { taskId: 't1', taskTitle: 'Задача 1', score: 8, source: 'peer', reviewerCount: 3 },
                        { taskId: 't2', taskTitle: 'Задача 2', score: 9, source: 'teacher', reviewerCount: 1 },
                        { taskId: 't3', taskTitle: 'Задача 3', score: 7, source: 'mixed', reviewerCount: 2 },
                    ],
                    finalCourseGrade: 8,
                },
            ],
        });

        await page.goto('/assignments');
        await page.locator('button:has-text("Сводная аналитика")').click();

        await expect(page.locator('th:text-is("Студент")')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('td:text-is("Анна")')).toBeVisible();

        await expect(page.locator('.bg-emerald-50').first()).toBeVisible();
        await expect(page.locator('.bg-blue-50').first()).toBeVisible();
        await expect(page.locator('.bg-purple-50').first()).toBeVisible();
    });

    test('7.2 — CSV-экспорт скачивает файл аналитики', async ({ page }) => {
        routeJson(page, '**/api/courses/*/analytics', {
            courseId: SUBJECT_ID,
            taskTitles: ['Задача 1'],
            rows: [{ studentId: 's1', studentName: 'Анна', taskGrades: [{ taskId: 't1', taskTitle: 'Задача 1', score: 9, source: 'teacher', reviewerCount: 1 }], finalCourseGrade: 9 }],
        });

        const csvContent = 'Student,Задача 1 (Score),Задача 1 (Source),Задача 1 (Reviewers),Final Course Grade\nАнна,9,Teacher,1,9\n';
        await page.route('**/api/courses/*/grades/export', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'text/csv',
                headers: { 'Content-Disposition': `attachment; filename="analytics-${SUBJECT_ID}.csv"` },
                body: csvContent,
            });
        });

        await page.goto('/assignments');
        await page.locator('button:has-text("Сводная аналитика")').click();
        await page.waitForSelector('text=Анна', { timeout: 5000 });

        const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
        await page.locator('button:has-text("CSV")').last().click();
        const download = await downloadPromise;

        expect(download.suggestedFilename()).toContain('analytics');
        expect(download.suggestedFilename()).toContain('.csv');

        const readable = await download.createReadStream();
        const chunks: Buffer[] = [];
        for await (const chunk of readable) {
            chunks.push(Buffer.from(chunk));
        }
        const csvText = Buffer.concat(chunks).toString('utf-8');
        expect(csvText).toContain('Анна');
        expect(csvText).toContain('Teacher');
    });

    test('7.3 — пустая аналитика: «Нет данных для отображения. Запустите пересчёт оценок.»', async ({ page }) => {
        routeJson(page, '**/api/courses/*/analytics', { courseId: SUBJECT_ID, taskTitles: [], rows: [] });

        await page.goto('/assignments');
        await page.locator('button:has-text("Сводная аналитика")').click();

        await expect(page.locator('text=Нет данных для отображения. Запустите пересчёт оценок.')).toBeVisible({ timeout: 5000 });
    });

    test('7.4 — CourseGradesPanel: finalSource бейдж + колонка «Проверок»', async ({ page }) => {
        routeJson(page, '**/api/courses/*/grades', [{
            studentId: 'student-a',
            studentName: 'Студент А',
            finalScore: 8,
            finalGrade: '5',
            finalSource: 'peer',
            reviewerCount: 3,
            calculatedAt: new Date().toISOString(),
        }]);

        await page.goto('/assignments');
        await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });

        await expect(page.locator('th:text-is("Источник")')).toBeVisible();
        await expect(page.locator('th:text-is("Проверок")')).toBeVisible();

        const gradeRow = page.locator('tr').filter({ hasText: 'Студент А' });
        await expect(gradeRow).toBeVisible({ timeout: 5000 });
        await expect(gradeRow.locator('text=Peer')).toBeVisible();
        await expect(gradeRow.locator('.text-slate-500').filter({ hasText: '3' })).toBeVisible();
    });
});
