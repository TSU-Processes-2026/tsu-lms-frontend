import { test, expect, Page } from '@playwright/test';
import { mockAuthLogin, loginAs, routeJson } from './mocks/handlers';
import { ASSIGNMENT_ID, SUBJECT_ID } from './mocks/fixtures';

async function setupStudentInTeam(page: Page, submissionsData: unknown[]) {
    await mockAuthLogin(page, 'student-a');
    routeJson(page, '**/api/users/me', { id: 'student-a', username: 'Студент А' });
    routeJson(page, /\/api\/subjects\?/, [{ id: SUBJECT_ID, title: 'Математика' }]);
    routeJson(page, /\/api\/subjects\/.*\/roles/, [{ subjectId: SUBJECT_ID, userId: 'student-a', role: 'student' }]);
    routeJson(page, /\/api\/subjects\/.*\/participants/, [
        { userId: 'teacher-uuid-001', username: 'преподаватель', role: 'teacher' },
        { userId: 'student-a', username: 'Студент А', role: 'student' },
        { userId: 'student-b', username: 'Студент Б', role: 'student' },
    ]);
    routeJson(page, /\/api\/subjects\/.*\/assignments/, [{
        id: ASSIGNMENT_ID, subjectId: SUBJECT_ID, authorId: 'teacher-uuid-001',
        postType: 'Assignment', content: 'Командное задание\nВыберите решение',
        createdAt: '2026-06-01T10:00:00Z',
        assignmentData: JSON.stringify({ max_points: 10 }), maxPoints: 10,
        selfAssessmentEnabled: false, deadLine: '2026-07-15T23:59:00Z', questions: [],
    }]);
    routeJson(page, /\/api\/assignments\/.*\/submissions/, submissionsData);
    routeJson(page, /\/api\/courses\/.*\/grades/, []);
    routeJson(page, /\/api\/tasks\/.*\/criteria/, { criteria: [], hidden: false });
    routeJson(page, '**/api/reviews/me', []);
    routeJson(page, /\/api\/submissions\/.*\/grade/, {}, 404);
    routeJson(page, '**/api/teams/*/assignments/*/grade', {}, 404);

    await page.route(/\/api\/subjects\/.*\/teams/, async (route) => {
        await route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({ teams: [{
                id: 'team-x', subjectId: SUBJECT_ID,
                memberIds: ['student-a', 'student-b', 'student-c'],
                members: [
                    { userId: 'student-a', username: 'Студент А', role: 'student' },
                    { userId: 'student-b', username: 'Студент Б', role: 'student' },
                    { userId: 'student-c', username: 'Студент В', role: 'student' },
                ],
                captainId: 'student-a',
            }] }),
        });
    });

    await loginAs(page, 'student-a');
}

test.describe('Team Decision Voting (Голосование за решение команды)', () => {

    test('студент открывает модал, видит заголовок и кнопку запуска голосования', async ({ page }) => {
        await setupStudentInTeam(page, [
            { id: 'sub-a', assignmentId: ASSIGNMENT_ID, authorId: 'student-a', authorName: 'Студент А', status: 'RequiresReview', answers: [], submittedAt: '2026-06-20T10:00:00Z' },
            { id: 'sub-b', assignmentId: ASSIGNMENT_ID, authorId: 'student-b', authorName: 'Студент Б', status: 'RequiresReview', answers: [], submittedAt: '2026-06-20T11:00:00Z' },
        ]);

        routeJson(page, '**/api/submissions/*/decision/status', {}, 404);
        routeJson(page, '**/api/submissions/*/decision/votes', {}, 404);

        await page.goto('/assignments');

        await expect(page.locator('text=Командное задание')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('button:has-text("Выбрать решение команды")')).toBeVisible({ timeout: 5000 });
        await page.locator('button:has-text("Выбрать решение команды")').click();
        await page.waitForTimeout(2000);

        await expect(page.locator('text=Выбор итогового решения команды').first()).toBeVisible({ timeout: 5000 });
    });

    test('студент запускает голосование и голосует ЗА решение', async ({ page }) => {
        let initiateCalled = false;
        let voteCalled = false;
        let voteBody: Record<string, unknown> | null = null;

        await setupStudentInTeam(page, [
            { id: 'sub-b', assignmentId: ASSIGNMENT_ID, authorId: 'student-b', authorName: 'Студент Б', status: 'RequiresReview', answers: [], submittedAt: '2026-06-20T11:00:00Z' },
        ]);

        routeJson(page, '**/api/submissions/*/decision/status', {
            mode: 'Voting', isClosed: false, totalTeamMembers: 3, decisionCast: 0,
            hasCurrentUserDecided: false, approvalsCount: 0, rejectionsCount: 0,
        });
        routeJson(page, '**/api/submissions/*/decision/votes', { totalVotes: 0, approvalsCount: 0, rejectionsCount: 0 });

        await page.route('**/api/submissions/*/decision/initiate', async (route) => {
            if (route.request().method() === 'POST') {
                initiateCalled = true;
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ mode: 'Voting', startedAt: new Date().toISOString() }) });
            } else { await route.continue(); }
        });

        await page.route('**/api/submissions/*/decision/vote', async (route) => {
            if (route.request().method() === 'POST') {
                voteCalled = true;
                voteBody = route.request().postDataJSON();
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ finalResult: 'Approved' }) });
            } else { await route.continue(); }
        });

        await page.goto('/assignments');
        await page.locator('button:has-text("Выбрать решение команды")').click();
        await page.waitForTimeout(2000);

        await page.locator('text=Студент Б').first().click();
        await page.waitForTimeout(1000);

        const initBtn = page.locator('button:has-text("Запустить голосование")');
        await expect(initBtn).toBeVisible({ timeout: 5000 });
        await initBtn.click();
        await page.waitForTimeout(1000);
        expect(initiateCalled).toBe(true);

        const approveBtn = page.locator('button:has-text("Поддержать решение")');
        await expect(approveBtn).toBeVisible({ timeout: 5000 });
        await approveBtn.click();
        await page.waitForTimeout(1000);
        expect(voteCalled).toBe(true);
        expect((voteBody as Record<string, unknown>).decision).toBe('Approve');
    });

    test('капитан утверждает решение (CaptainDecides)', async ({ page }) => {
        let captainApproved = false;

        await setupStudentInTeam(page, [
            { id: 'sub-b', assignmentId: ASSIGNMENT_ID, authorId: 'student-b', authorName: 'Студент Б', status: 'RequiresReview', answers: [], submittedAt: '2026-06-20T11:00:00Z' },
        ]);

        routeJson(page, '**/api/submissions/*/decision/status', {
            mode: 'CaptainDecides', isClosed: false, totalTeamMembers: 3, decisionCast: 0,
            hasCurrentUserDecided: false, approvalsCount: 0, rejectionsCount: 0,
        });
        routeJson(page, '**/api/submissions/*/decision/votes', {});

        await page.route('**/api/submissions/*/decision/captain-approve', async (route) => {
            if (route.request().method() === 'POST') {
                captainApproved = true;
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: 'Approved' }) });
            } else { await route.continue(); }
        });

        await page.goto('/assignments');
        await page.locator('button:has-text("Выбрать решение команды")').click();
        await page.waitForTimeout(2000);

        await page.locator('text=Студент Б').first().click();
        await page.waitForTimeout(1000);

        const approveBtn = page.locator('button:has-text("Утвердить решение")');
        await expect(approveBtn).toBeVisible({ timeout: 5000 });
        await approveBtn.click();
        await page.waitForTimeout(1000);
        expect(captainApproved).toBe(true);
    });
});
