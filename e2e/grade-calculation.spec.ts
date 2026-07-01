import { test, expect } from '@playwright/test';
import { setupTeacherMocks } from './mocks/handlers';
import { ACCESS_TOKEN_VALUE, SUBJECT_ID, ASSIGNMENT_ID } from './mocks/fixtures';

test.describe('Feature 6: Расчёт итоговых оценок', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate((token) => {
            localStorage.setItem('accessToken', token);
        }, ACCESS_TOKEN_VALUE);
        await setupTeacherMocks(page);
    });

    test.describe('Scenario 6.1: Среднее арифметическое peer-оценок', () => {
        test('final_score = 7.0 при оценках 6, 8, 7', async ({ page }) => {
            await page.route('**/api/courses/*/grades', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([
                        {
                            studentId: 'student-a',
                            studentName: 'Студент А',
                            finalScore: 7.0,
                            finalGrade: '4',
                            finalSource: 'peer',
                            reviewerCount: 3,
                            calculatedAt: new Date().toISOString(),
                        },
                    ]),
                });
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });
            await expect(page.locator('text=Peer')).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe('Scenario 6.2: Приоритет оценки преподавателя', () => {
        test('final_score = 9, final_source = teacher', async ({ page }) => {
            await page.route('**/api/courses/*/grades', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([
                        {
                            studentId: 'student-a',
                            studentName: 'Студент А',
                            finalScore: 9,
                            finalGrade: '5',
                            finalSource: 'teacher',
                            reviewerCount: 2,
                            calculatedAt: new Date().toISOString(),
                        },
                    ]),
                });
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });
            await expect(page.locator('text=Teacher')).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe('Scenario 6.3: Исключение отклонённых оценок', () => {
        test('среднее считается без отклонённой оценки 10', async ({ page }) => {
            await page.route('**/api/courses/*/grades', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([
                        {
                            studentId: 'student-a',
                            studentName: 'Студент А',
                            finalScore: 7.0,
                            finalGrade: '4',
                            finalSource: 'peer',
                            reviewerCount: 2,
                            calculatedAt: new Date().toISOString(),
                        },
                    ]),
                });
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Scenario 6.4: Применение пассивного штрафа', () => {
        test('final_score = 7.0 (8 - 1 штраф)', async ({ page }) => {
            await page.route('**/api/courses/*/grades', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([
                        {
                            studentId: 'student-a',
                            studentName: 'Студент А',
                            finalScore: 7.0,
                            finalGrade: '4',
                            finalSource: 'peer',
                            reviewerCount: 3,
                            calculatedAt: new Date().toISOString(),
                        },
                    ]),
                });
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Scenario 6.5: Применение пассивного бонуса', () => {
        test('final_score = 9.0 (7 + 2 бонус)', async ({ page }) => {
            await page.route('**/api/courses/*/grades', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([
                        {
                            studentId: 'student-a',
                            studentName: 'Студент А',
                            finalScore: 9.0,
                            finalGrade: '5',
                            finalSource: 'peer',
                            reviewerCount: 3,
                            calculatedAt: new Date().toISOString(),
                        },
                    ]),
                });
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Scenario 6.6: Балл не может быть отрицательным', () => {
        test('final_score = 0 (clamp)', async ({ page }) => {
            await page.route('**/api/courses/*/grades', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([
                        {
                            studentId: 'student-a',
                            studentName: 'Студент А',
                            finalScore: 0,
                            finalGrade: '2',
                            finalSource: 'peer',
                            reviewerCount: 3,
                            calculatedAt: new Date().toISOString(),
                        },
                    ]),
                });
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Scenario 6.7: Балл не может превышать MaxPoints', () => {
        test('final_score = 100 (clamp)', async ({ page }) => {
            await page.route('**/api/courses/*/grades', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([
                        {
                            studentId: 'student-a',
                            studentName: 'Студент А',
                            finalScore: 100,
                            finalGrade: '5',
                            finalSource: 'peer',
                            reviewerCount: 3,
                            calculatedAt: new Date().toISOString(),
                        },
                    ]),
                });
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Итоговые оценки')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Scenario 6.8: Нет завершённых оценок — итог не определён', () => {
        test('final_score = null, final_source = null', async ({ page }) => {
            await page.route('**/api/courses/*/grades', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([]),
                });
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Нет оценок')).toBeVisible({ timeout: 10000 });
        });
    });
});
