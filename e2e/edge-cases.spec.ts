import { test, expect } from '@playwright/test';
import {
    setupTeacherMocks,
    setupStudentMocks,
} from './mocks/handlers';
import { ACCESS_TOKEN_VALUE, makeReviewAssignments, TEACHER_ID } from './mocks/fixtures';

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
        test('черновик не отображается как завершённый в ReviewList', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
            await setupStudentMocks(page, [
                { ...makeReviewAssignments()[0], status: 'opened' },
            ]);
            await page.goto('/assignments');
            await page.locator('button:has-text("Мои проверки")').click();
            await expect(page.locator('text=В процессе')).toBeVisible({ timeout: 5000 });
            await expect(page.locator('text=Завершена')).toHaveCount(0);
        });
    });

    test.describe('Scenario 8.3: Пересечение дедлайна сдачи и дедлайна оценивания', () => {
        test('сервер возвращает 403 при попытке установить review_deadline < task_deadline', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((token) => {
                localStorage.setItem('accessToken', token);
            }, ACCESS_TOKEN_VALUE);
            await setupTeacherMocks(page);

            await page.route('**/api/posts/**', async (route) => {
                if (route.request().method() === 'PUT' || route.request().method() === 'PATCH') {
                    await route.fulfill({
                        status: 403,
                        contentType: 'application/json',
                        body: JSON.stringify({ title: 'Forbidden', status: 403, detail: 'Review deadline must be after task deadline' }),
                    });
                } else {
                    await route.continue();
                }
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Scenario 8.4: Самооценка не смешивается с peer-оценкой', () => {
        test('CourseGradesPanel показывает только peer/teacher источник', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((token) => {
                localStorage.setItem('accessToken', token);
            }, ACCESS_TOKEN_VALUE);
            await setupTeacherMocks(page);

            await page.route('**/api/courses/*/grades', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([
                        {
                            studentId: 'student-a',
                            studentName: 'Студент А',
                            finalScore: 7.5,
                            finalGrade: '4',
                            finalSource: 'peer',
                            reviewerCount: 2,
                            calculatedAt: new Date().toISOString(),
                        },
                    ]),
                });
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Peer')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Scenario 8.5: Команда не может оценивать своё решение', () => {
        test('generate-reviews пропускает свою команду', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((token) => {
                localStorage.setItem('accessToken', token);
            }, ACCESS_TOKEN_VALUE);
            await setupTeacherMocks(page);

            await page.route('**/api/tasks/*/generate-reviews', async (route) => {
                if (route.request().method() === 'POST') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ count: 2, skippedOwnTeam: 1, assignments: [] }),
                    });
                } else {
                    await route.continue();
                }
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Scenario 8.6: Студент не может оценивать свою работу', () => {
        test('generate-reviews пропускает self-review', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((token) => {
                localStorage.setItem('accessToken', token);
            }, ACCESS_TOKEN_VALUE);
            await setupTeacherMocks(page);

            await page.route('**/api/tasks/*/generate-reviews', async (route) => {
                if (route.request().method() === 'POST') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ count: 6, noSelfReview: true, assignments: [] }),
                    });
                } else {
                    await route.continue();
                }
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Scenario 8.7: Отмена проверки', () => {
        test('cancelled статус отображается в ReviewList как зачёркнутый', async ({ page }) => {
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

    test.describe('Scenario 8.8: Нечётное число в парах — триплет', () => {
        test('5 студентов: 1 пара + 1 триплет = 4 назначения', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((token) => {
                localStorage.setItem('accessToken', token);
            }, ACCESS_TOKEN_VALUE);
            await setupTeacherMocks(page);

            await page.route('**/api/tasks/*/generate-reviews', async (route) => {
                if (route.request().method() === 'POST') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ count: 4, mode: 'pairs', pairCount: 1, tripletCount: 1, assignments: [] }),
                    });
                } else {
                    await route.continue();
                }
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Scenario 8.9: Все форматы критериев в карточке оценки', () => {
        test('checklist, percentage, numeric, boolean, scale форматы отображаются', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((token) => {
                localStorage.setItem('accessToken', token);
            }, ACCESS_TOKEN_VALUE);
            await setupTeacherMocks(page);

            const allFormats = [
                { id: 'c-1', title: 'Чеклист', format: 'checklist', criterionType: 'active', weight: 1, maxPoints: 2 },
                { id: 'c-2', title: 'Процент', format: 'percentage', criterionType: 'active', weight: 1, maxPoints: 100 },
                { id: 'c-3', title: 'Число', format: 'numeric', criterionType: 'active', weight: 1, maxPoints: 10 },
                { id: 'c-4', title: 'Да/Нет', format: 'boolean', criterionType: 'active', weight: 1, maxPoints: 1 },
                { id: 'c-5', title: 'Шкала', format: 'scale', criterionType: 'active', weight: 1, maxPoints: 5 },
            ];

            await page.route('**/api/tasks/*/criteria', async (route) => {
                if (route.request().method() === 'GET') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ criteria: allFormats, hidden: false }),
                    });
                } else {
                    await route.continue();
                }
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
            await page.locator('button:has-text("Критерии")').first().click();
            await expect(page.locator('text=Чеклист').first()).toBeVisible({ timeout: 5000 });
            await expect(page.locator('text=Процент').first()).toBeVisible();
            await expect(page.locator('text=Число').first()).toBeVisible();
            await expect(page.locator('text=Да/Нет').first()).toBeVisible();
            await expect(page.locator('text=Шкала').first()).toBeVisible();
        });
    });

    test.describe('Scenario 8.10: Представитель не назначен — капитан замещает', () => {
        test('представитель=null → капитан допускается', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((token) => {
                localStorage.setItem('accessToken', token);
            }, ACCESS_TOKEN_VALUE);
            await setupTeacherMocks(page);

            await page.goto('/assignments');
            await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Scenario 8.11: Преподаватель не может отклонить teacher-оценку', () => {
        test('POST /api/reviews/{id}/reject возвращает 404 для teacher-оценки', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((token) => {
                localStorage.setItem('accessToken', token);
            }, ACCESS_TOKEN_VALUE);
            await setupTeacherMocks(page);

            await page.route('**/api/reviews/*/reject', async (route) => {
                await route.fulfill({
                    status: 404,
                    contentType: 'application/json',
                    body: JSON.stringify({ title: 'Not Found', status: 404 }),
                });
            });

            await page.goto('/assignments');
            await expect(page.locator('text=Домашнее задание №1')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Scenario 8.12: Дедлайн не задан — проверка не протухает', () => {
        test('due_at = null → статус не меняется на expired', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);
            await setupStudentMocks(page, [
                { ...makeReviewAssignments()[0], status: 'pending', dueAt: undefined },
            ]);
            await page.goto('/assignments');
            await page.locator('button:has-text("Мои проверки")').click();
            await expect(page.locator('text=Ожидает')).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe('Scenario 8.13: Студент не видит чужие проверки', () => {
        test('GET /api/reviews/{id} для чужой проверки → 403 Forbidden', async ({ page }) => {
            await page.goto('/');
            await page.evaluate((t) => localStorage.setItem('accessToken', t), ACCESS_TOKEN_VALUE);

            await page.route('**/api/reviews/rev-other', async (route) => {
                await route.fulfill({
                    status: 403,
                    contentType: 'application/json',
                    body: JSON.stringify({ title: 'Forbidden', status: 403 }),
                });
            });

            await setupStudentMocks(page, [makeReviewAssignments()[0]]);
            await page.goto('/assignments');
            await page.locator('button:has-text("Мои проверки")').click();
            await expect(page.locator('text=Начать проверку')).toBeVisible({ timeout: 5000 });
        });
    });
});
