import { Page } from '@playwright/test';
import {
    makeProfile,
    makeSubjects,
    makeSubjectRoles,
    makeParticipants,
    makeTeams,
    makeAssignments,
    makeSubmissions,
    makeCriteria,
    makeCourseGrades,
    makeAnalyticsRows,
} from './fixtures';

let criteriaStore: Record<string, unknown[]> = {};

function json(page: Page, url: string | RegExp, data: unknown, status = 200) {
    return page.route(url, async (route) => {
        await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
    });
}

export function routeJson(page: Page, url: string | RegExp, data: unknown, status = 200) {
    return page.route(url, async (route) => {
        await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
    });
}

export function routeRaw(page: Page, url: string | RegExp, options: { status?: number; contentType?: string; headers?: Record<string, string>; body: string }) {
    return page.route(url, async (route) => {
        await route.fulfill({ status: options.status ?? 200, contentType: options.contentType ?? 'application/json', headers: options.headers, body: options.body });
    });
}

export function resetCriteriaStore() {
    criteriaStore = {};
}

export async function setupTeacherMocks(page: Page, options?: { submissions?: unknown; withGrade404?: boolean }) {
    resetCriteriaStore();
    json(page, /\/api\/users\/me/, makeProfile());
    json(page, /\/api\/subjects\?/, makeSubjects());
    json(page, /\/api\/subjects\/.*\/roles/, makeSubjectRoles());
    json(page, /\/api\/subjects\/.*\/participants/, makeParticipants());
    json(page, /\/api\/subjects\/.*\/teams/, makeTeams());
    json(page, /\/api\/subjects\/.*\/assignments/, makeAssignments());
    json(page, /\/api\/assignments\/.*\/submissions/, options?.submissions ?? makeSubmissions());
    if (options?.withGrade404) {
        json(page, /\/api\/submissions\/.*\/grade/, {}, 404);
    }
    json(page, /\/api\/submissions\/.*/, { id: 'sub-detail', criterionResults: [], criteriaResults: [] });
    json(page, /\/api\/courses\/.*\/grades/, makeCourseGrades());
    json(page, /\/api\/courses\/.*\/analytics/, makeAnalyticsRows());
    json(page, /\/api\/courses\/.*\/calculate-grades/, { success: true }, 200);

    await page.route(/\/api\/tasks\/.*\/criteria/, async (route) => {
        const url = route.request().url();
        const match = url.match(/\/api\/tasks\/([^/?]+)\/criteria/);
        const taskId = match ? match[1] : '';
        if (route.request().method() === 'GET') {
            const stored = criteriaStore[taskId] ?? [];
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ criteria: stored, hidden: false }) });
        } else if (route.request().method() === 'POST') {
            const body = JSON.parse(route.request().postData() || '{}');
            const item = { id: `criterion-${Date.now()}`, taskId, order: (criteriaStore[taskId] ?? []).length + 1, ...body };
            criteriaStore[taskId] = [...(criteriaStore[taskId] ?? []), item];
            await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(item) });
        } else {
            await route.continue();
        }
    });
}

export async function setupHiddenCriteria(page: Page) {
    resetCriteriaStore();
    json(page, /\/api\/users\/me/, { id: 'student-a', username: 'Студент А' });
    json(page, /\/api\/subjects\?/, makeSubjects());
    json(page, /\/api\/subjects\/.*\/roles/, makeSubjectRoles());
    json(page, /\/api\/subjects\/.*\/participants/, makeParticipants());
    json(page, /\/api\/subjects\/.*\/teams/, makeTeams());
    json(page, /\/api\/subjects\/.*\/assignments/, makeAssignments());
    json(page, /\/api\/assignments\/.*\/submissions/, [
        { id: 'sub-student-a', assignmentId: 'assignment-task-001', authorId: 'student-a', status: 'Draft', answers: {} },
    ]);
    json(page, /\/api\/courses\/.*\/grades/, makeCourseGrades());
    json(page, /\/api\/tasks\/.*\/criteria/, { criteria: [], hidden: true });
}

export async function setupStudentMocks(page: Page, reviewsPayload: unknown) {
    resetCriteriaStore();
    json(page, /\/api\/users\/me/, { id: 'student-a', username: 'Студент А' });
    json(page, /\/api\/subjects\?/, makeSubjects());
    json(page, /\/api\/subjects\/.*\/roles/, [{ subjectId: 'subject-math-101', userId: 'student-a', role: 'student' }]);
    json(page, /\/api\/subjects\/.*\/participants/, [
        { userId: 'teacher-uuid-001', username: 'преподаватель', role: 'teacher' },
        { userId: 'student-a', username: 'Студент А', role: 'student' },
        { userId: 'student-b', username: 'Студент Б', role: 'student' },
    ]);
    json(page, /\/api\/subjects\/.*\/teams/, { teams: [] });
    json(page, /\/api\/subjects\/.*\/assignments/, makeAssignments());
    json(page, /\/api\/assignments\/.*\/submissions/, [
        { id: 'sub-student-a', assignmentId: 'assignment-task-001', authorId: 'student-a', status: 'RequiresReview', answers: {}, submittedAt: '2026-06-20T10:00:00Z' },
    ]);
    json(page, /\/api\/courses\/.*\/grades/, makeCourseGrades());
    json(page, /\/api\/tasks\/.*\/criteria/, []);

    json(page, /\/api\/reviews\/me/, reviewsPayload);

    await page.route(/\/api\/reviews\/.*\/start/, async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json',
            body: JSON.stringify({ status: 'opened', submission: { answers: {} } }) });
    });
    await page.route(/\/api\/reviews\/.*\/save-draft/, async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ saved: true }) });
    });
    await page.route(/\/api\/reviews\/.*\/submit/, async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'submitted' }) });
    });
}

export async function setupSubjectViewMocks(page: Page) {
    resetCriteriaStore();
    json(page, /\/api\/users\/me/, makeProfile());
    json(page, /\/api\/subjects\?/, makeSubjects());
    json(page, /\/api\/subjects\/.*\/participants/, makeParticipants());
    json(page, /\/api\/subjects\/.*\/assignments/, makeAssignments());
    json(page, /\/api\/assignments\/.*\/submissions/, makeSubmissions());
    json(page, /\/api\/subjects\/.*\/posts/, []);
    json(page, /\/api\/comments/, []);
    json(page, /\/api\/courses\/.*\/grades/, makeCourseGrades());
    json(page, /\/api\/courses\/.*\/calculate-grades/, { success: true }, 200);
    json(page, /\/api\/tasks\/.*\/criteria/, { criteria: [], hidden: false });

    await page.route(/\/api\/subjects\/.*\/teams/, async (route) => {
        const url = route.request().url();
        if (url.includes('/teams/settings')) {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    subjectId: 'subject-math-101',
                    isFinalized: false,
                    finalizedAt: null,
                    distributionMode: 'Random',
                    fixedTeamsCount: 2,
                    fixedTeamSize: 3,
                    minTeamSize: 2,
                    maxTeamSize: 5,
                    warnings: [],
                }),
            });
        } else {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([]),
            });
        }
    });
}

export async function setupTeacherReviewDetailMocks(page: Page, submissionsData: unknown, reviewsData: unknown) {
    json(page, /\/api\/users\/me/, makeProfile());
    json(page, /\/api\/subjects\?/, makeSubjects());
    json(page, /\/api\/subjects\/.*\/roles/, makeSubjectRoles());
    json(page, /\/api\/subjects\/.*\/participants/, makeParticipants());
    json(page, /\/api\/subjects\/.*\/teams/, makeTeams());
    json(page, /\/api\/subjects\/.*\/assignments/, makeAssignments());
    json(page, /\/api\/assignments\/.*\/submissions/, submissionsData);
    json(page, /\/api\/courses\/.*\/grades/, makeCourseGrades());
    json(page, /\/api\/courses\/.*\/analytics/, makeAnalyticsRows());
    json(page, /\/api\/courses\/.*\/calculate-grades/, { success: true }, 200);
    json(page, /\/api\/submissions\/.*\/reviews/, reviewsData);
    json(page, /\/api\/tasks\/.*\/criteria/, makeCriteria());
    json(page, /\/api\/submissions\/.*\/grade/, {}, 404);

    await page.route(/\/api\/reviews\/.*\/reject/, async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rejected: true }) });
    });
    await page.route(/\/api\/submissions\/.*\/final-grade/, async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ finalScore: 8, finalSource: 'teacher' }) });
    });
}
