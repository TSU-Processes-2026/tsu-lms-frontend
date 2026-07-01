import { test, expect } from '@playwright/test';
import { mockAuthLogin, loginAs } from './mocks/handlers';
import { SUBJECT_ID } from './mocks/fixtures';

const teamMembers = [
    { userId: 'student-a', username: 'Студент А' },
    { userId: 'student-b', username: 'Студент Б' },
    { userId: 'student-c', username: 'Студент В' },
];

const teamData = {
    teams: [{
        id: 'team-x',
        subjectId: SUBJECT_ID,
        memberIds: ['student-a', 'student-b', 'student-c'],
        members: teamMembers,
        representativeId: null,
    }],
    distributionMode: 'Manual',
};

const votingStatusOpen = {
    sessionId: 'session-1',
    teamId: 'team-x',
    startedAt: '2026-06-20T10:00:00Z',
    deadlineAt: '2026-07-20T10:00:00Z',
    isClosed: false,
    closedAt: null,
    winnerId: null,
    totalMembers: 3,
    votesCast: 0,
    hasCurrentUserVoted: false,
};

const votingStatusVoted = {
    ...votingStatusOpen,
    votesCast: 1,
    hasCurrentUserVoted: true,
};

const votingStatusClosed = {
    ...votingStatusOpen,
    isClosed: true,
    closedAt: '2026-07-01T10:00:00Z',
    winnerId: 'student-a',
    votesCast: 3,
};

async function setupCaptainMocks(
    page: import('@playwright/test').Page,
    profileId: string,
    profileName: string,
    voting: typeof votingStatusOpen,
) {
    await mockAuthLogin(page, profileId);
    await page.route(/\/api\/users\/me/, async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: profileId, username: profileName }) });
    });
    await page.route(/\/api\/subjects(\?|$)/, async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: SUBJECT_ID, title: 'Математика' }]) });
    });
    await page.route(/\/api\/subjects\/.*\/teams/, async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(teamData) });
    });
    await page.route(/\/api\/subjects\/.*\/captain\/voting-status/, async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(voting) });
    });
}

test.describe('Голосование за капитана (CaptainVotingPage)', () => {

    test('a — студент голосует за капитана', async ({ page }) => {
        const profileId = 'student-b';
        await setupCaptainMocks(page, profileId, 'Студент Б', votingStatusOpen);

        let voteBody: unknown = null;
        await page.route(/\/api\/subjects\/.*\/captain\/vote/, async (route) => {
            if (route.request().method() === 'POST') {
                voteBody = route.request().postDataJSON();
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ sessionCompleted: false, selectedCaptainId: '' }) });
            } else {
                await route.continue();
            }
        });

        await loginAs(page, profileId);

        await page.goto(`/subjects/${SUBJECT_ID}/teams/team-x/${profileId}/captain-voting`);
        await expect(page.locator('text=Голосование за назначение капитана')).toBeVisible({ timeout: 15000 });

        await expect(page.locator('text=Открыт')).toBeVisible({ timeout: 10000 });

        const voteButton = page.locator('button:has-text("Проголосовать")');
        await expect(voteButton).toBeVisible({ timeout: 5000 });
        await voteButton.click();

        expect(voteBody).not.toBeNull();
        expect((voteBody as Record<string, string>).votedForUserId).toBe('student-a');

        await expect(page.locator('text=✅').first()).toBeVisible({ timeout: 5000 });
    });

    test('b — уже проголосовал (кнопка скрыта)', async ({ page }) => {
        const profileId = 'student-b';
        await setupCaptainMocks(page, profileId, 'Студент Б', votingStatusVoted);

        await loginAs(page, profileId);

        await page.goto(`/subjects/${SUBJECT_ID}/teams/team-x/${profileId}/captain-voting`);
        await expect(page.locator('text=Голосование за назначение капитана')).toBeVisible({ timeout: 15000 });

        await expect(page.locator('button:has-text("Проголосовать")')).not.toBeVisible();
        await expect(page.locator('text=Голос отправлен').first()).toBeVisible({ timeout: 5000 });
    });

    test('c — голосование завершено, показан победитель', async ({ page }) => {
        const profileId = 'student-b';
        await setupCaptainMocks(page, profileId, 'Студент Б', votingStatusClosed);

        await loginAs(page, profileId);

        await page.goto(`/subjects/${SUBJECT_ID}/teams/team-x/${profileId}/captain-voting`);
        await expect(page.locator('text=Голосование за назначение капитана')).toBeVisible({ timeout: 15000 });

        await expect(page.locator('text=Завершен')).toBeVisible({ timeout: 10000 });

        await expect(page.locator('text=Победитель:').first()).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=Студент А').first()).toBeVisible({ timeout: 5000 });

        await expect(page.locator('button:has-text("Проголосовать")')).not.toBeVisible();
    });

    test('d — преподаватель на странице голосования', async ({ page }) => {
        const profileId = 'teacher-uuid-001';
        await setupCaptainMocks(page, profileId, 'преподаватель', votingStatusOpen);

        await loginAs(page, profileId);

        await page.goto(`/subjects/${SUBJECT_ID}/teams/team-x/${profileId}/captain-voting`);
        await expect(page.locator('text=Голосование за назначение капитана')).toBeVisible({ timeout: 15000 });

        await expect(page.locator('text=Открыт')).toBeVisible({ timeout: 10000 });

        const voteButton = page.locator('button:has-text("Проголосовать")');
        await expect(voteButton).toBeVisible({ timeout: 5000 });
    });
});
