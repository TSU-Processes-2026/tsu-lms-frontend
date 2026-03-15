import { DEV_URL, PROD_URL, MOCK_URL } from '@/constants/config/config';
import { ACCESS_TOKEN } from '@/constants/auth/auth';
import { Participant, Assignment, Submission } from '@/hooks/subject/useSubjects';

const BASE_URL = DEV_URL || PROD_URL || MOCK_URL;

/**
 * Returns the headers for authentication.
 *
 * @returns {Record<string, string>} Headers object with Authorization and Content-Type.
 */
const getAuthHeaders = (): Record<string, string> => ({
  'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
  'Content-Type': 'application/json',
});

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
  options?: { limit?: number; offset?: number }
): Promise<Participant[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', String(options.limit));
  if (options?.offset) params.append('offset', String(options.offset));
  const url = `${BASE_URL}/subjects/${subjectId}/participants${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    let err;
    if (res.status === 404) err = new Error('Not found');
    else if (res.status === 401) err = new Error('Unauthorized');
    else if (res.status === 403) err = new Error('Forbidden');
    else err = new Error('Failed to load participants');
    throw err;
  }
  return await res.json();
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
  options?: { limit?: number; offset?: number }
): Promise<Assignment[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', String(options.limit));
  if (options?.offset) params.append('offset', String(options.offset));
  const url = `${BASE_URL}/subjects/${subjectId}/assignments${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    let err;
    if (res.status === 404) err = new Error('Not found');
    else if (res.status === 401) err = new Error('Unauthorized');
    else if (res.status === 403) err = new Error('Forbidden');
    else err = new Error('Failed to load assignments');
    throw err;
  }
  return await res.json();
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
  options?: { limit?: number; offset?: number; isTeacher?: boolean }
): Promise<Submission[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', String(options.limit));
  if (options?.offset) params.append('offset', String(options.offset));
  if (typeof options?.isTeacher === 'boolean') params.append('isTeacher', String(options.isTeacher));
  const url = `${BASE_URL}/assignments/${assignmentId}/submissions${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    let err;
    if (res.status === 404) err = new Error('Not found');
    else if (res.status === 401) err = new Error('Unauthorized');
    else if (res.status === 403) err = new Error('Forbidden');
    else err = new Error('Failed to load submissions');
    throw err;
  }
  return await res.json();
}

