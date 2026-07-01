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
} from './fixtures';

let criteriaStore: Record<string, unknown[]> = {};

function jsonRoute(page: Page, urlPattern: string | RegExp, factory: () => unknown) {
    return page.route(urlPattern, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(factory()),
        });
    });
}

function jsonRouteWithBody(page: Page, urlPattern: string | RegExp, factory: (body: unknown) => unknown) {
    return page.route(urlPattern, async (route) => {
        const body = route.request().method() === 'POST' || route.request().method() === 'PUT' || route.request().method() === 'PATCH'
            ? JSON.parse(route.request().postData() || '{}')
            : {};
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(factory(body)),
        });
    });
}

export function resetCriteriaStore() {
    criteriaStore = {};
}

export async function setupAllMocks(page: Page) {
    resetCriteriaStore();

    await jsonRoute(page, /\/api\/users\/me/, makeProfile);
    await jsonRoute(page, /\/api\/subjects\?/, makeSubjects);
    await jsonRoute(page, /\/api\/subjects\/.*\/roles/, makeSubjectRoles);
    await jsonRoute(page, /\/api\/subjects\/.*\/participants/, makeParticipants);
    await jsonRoute(page, /\/api\/subjects\/.*\/teams/, makeTeams);
    await jsonRoute(page, /\/api\/subjects\/.*\/assignments/, makeAssignments);
    await jsonRoute(page, /\/api\/assignments\/.*\/submissions/, makeSubmissions);
    await jsonRoute(page, /\/api\/courses\/.*\/grades/, makeCourseGrades);

    await page.route(/\/api\/tasks\/.*\/criteria/, async (route) => {
        const url = route.request().url();
        const taskIdMatch = url.match(/\/api\/tasks\/([^/?]+)\/criteria/);
        const taskId = taskIdMatch ? taskIdMatch[1] : '';

        if (route.request().method() === 'GET') {
            const stored = criteriaStore[taskId] ?? [];
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ criteria: stored, hidden: false }),
            });
        } else if (route.request().method() === 'POST') {
            const body = JSON.parse(route.request().postData() || '{}');
            const newCriterion = {
                id: `criterion-${Date.now()}`,
                taskId,
                order: (criteriaStore[taskId] ?? []).length + 1,
                ...body,
            };
            criteriaStore[taskId] = [...(criteriaStore[taskId] ?? []), newCriterion];
            await route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify(newCriterion),
            });
        } else {
            await route.continue();
        }
    });
}
