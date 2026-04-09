import { apiClient } from '@/api/axios-client';
import {
    Participant,
    Assignment,
    Submission,
    UpdateParticipantRoleRequest,
} from '@/hooks/subject/useSubjects';
import { Subject } from '@/types/subject/Subject';

/**
 * Fetches subjects from the API with optional pagination.
 *
 * @param {Object} [options] - Optional query parameters.
 * @param {number} [options.limit] - Limit of subjects to fetch.
 * @param {number} [options.offset] - Offset for pagination.
 * @returns {Promise<Subject[]>} Array of subjects.
 * @throws {Error} Throws error for 401, 403, or other failed requests.
 */
export async function fetchSubjects(options?: {
    limit?: number;
    offset?: number;
}): Promise<Subject[]> {
    try {
        const params = new URLSearchParams();
        if (options?.limit) params.append('limit', String(options.limit));
        if (options?.offset) params.append('offset', String(options.offset));

        const url = `/subjects${params.toString() ? '?' + params.toString() : ''}`;
        const response = await apiClient.get<Subject[]>(url);

        return response.data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('Unauthorized');
        } else if (error.response?.status === 403) {
            throw new Error('Forbidden');
        } else {
            throw new Error('Failed to load subjects');
        }
    }
}

/**
 * Fetches participants for a subject by subjectId.
 *
 * @param {string} subjectId - The ID of the subject.
 * @param {Object} [options] - Optional query parameters.
 * @param {number} [options.limit] - Limit of participants.
 * @param {number} [options.offset] - Offset for pagination.
 * @returns {Promise<Participant[]>} Array of participants.
 * @throws {Error} If network request fails.
 */
export async function fetchSubjectParticipants(
    subjectId: string,
    options?: { limit?: number; offset?: number },
): Promise<Participant[]> {
    try {
        const params = new URLSearchParams();
        if (options?.limit) params.append('limit', String(options.limit));
        if (options?.offset) params.append('offset', String(options.offset));

        const url = `/subjects/${subjectId}/participants${params.toString() ? '?' + params.toString() : ''}`;
        const response = await apiClient.get<Participant[]>(url);

        return response.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            throw new Error('Not found');
        } else if (error.response?.status === 401) {
            throw new Error('Unauthorized');
        } else if (error.response?.status === 403) {
            throw new Error('Forbidden');
        } else {
            throw new Error('Failed to load participants');
        }
    }
}

/**
 * Fetches assignments for a subject by subjectId.
 *
 * @param {string} subjectId - The ID of the subject.
 * @param {Object} [options] - Optional query parameters.
 * @param {number} [options.limit] - Limit of assignments.
 * @param {number} [options.offset] - Offset for pagination.
 * @returns {Promise<Assignment[]>} Array of assignments.
 * @throws {Error} If network request fails.
 */
export async function fetchSubjectAssignments(
    subjectId: string,
    options?: { limit?: number; offset?: number },
): Promise<Assignment[]> {
    try {
        const params = new URLSearchParams();
        if (options?.limit) params.append('limit', String(options.limit));
        if (options?.offset) params.append('offset', String(options.offset));

        const url = `/subjects/${subjectId}/assignments${params.toString() ? '?' + params.toString() : ''}`;
        const response = await apiClient.get<Assignment[]>(url);

        return response.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            throw new Error('Not found');
        } else if (error.response?.status === 401) {
            throw new Error('Unauthorized');
        } else if (error.response?.status === 403) {
            throw new Error('Forbidden');
        } else {
            throw new Error('Failed to load assignments');
        }
    }
}

/**
 * Fetches submissions for an assignment by assignmentId.
 *
 * @param {string} assignmentId - The ID of the assignment.
 * @param {Object} [options] - Optional query parameters.
 * @param {number} [options.limit] - Limit of submissions.
 * @param {number} [options.offset] - Offset for pagination.
 * @param {boolean} [options.isTeacher] - If true, fetch as teacher.
 * @returns {Promise<Submission[]>} Array of submissions.
 * @throws {Error} If network request fails.
 */
export async function fetchAssignmentSubmissions(
    assignmentId: string,
    options?: { limit?: number; offset?: number; isTeacher?: boolean },
): Promise<Submission[]> {
    try {
        const params = new URLSearchParams();
        if (options?.limit) params.append('limit', String(options.limit));
        if (options?.offset) params.append('offset', String(options.offset));
        if (typeof options?.isTeacher === 'boolean')
            params.append('isTeacher', String(options.isTeacher));

        const url = `/assignments/${assignmentId}/submissions${params.toString() ? '?' + params.toString() : ''}`;
        const response = await apiClient.get<Submission[]>(url);

        return response.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            throw new Error('Not found');
        } else if (error.response?.status === 401) {
            throw new Error('Unauthorized');
        } else if (error.response?.status === 403) {
            throw new Error('Forbidden');
        } else {
            throw new Error('Failed to load submissions');
        }
    }
}

/**
 * Updates the role of a participant in a subject.
 *
 * @param {string} subjectId - Subject identifier (UUID).
 * @param {string} userId - User identifier (UUID).
 * @param {UpdateParticipantRoleRequest} request - Object containing the new role.
 * @returns {Promise<Participant>} Updated participant object.
 * @throws {Error} If the request fails or user is unauthorized.
 */
export async function updateParticipantRole(
    subjectId: string,
    userId: string,
    request: UpdateParticipantRoleRequest,
): Promise<Participant> {
    try {
        const url = `/subjects/${subjectId}/participants/${userId}`;
        const response = await apiClient.patch<Participant>(url, request);

        return response.data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('Unauthorized');
        } else if (error.response?.status === 403) {
            throw new Error('Forbidden');
        } else if (error.response?.status === 404) {
            throw new Error('Not found');
        } else {
            throw new Error('Failed to update participant role');
        }
    }
}
