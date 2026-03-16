import { DEV_URL, PROD_URL, MOCK_URL } from '@/constants/config/config';
import { ACCESS_TOKEN } from '@/constants/auth/auth';
import { PostResponse, CommentResponse } from '@/types/subject/FeedTypes';

const BASE_URL = DEV_URL || PROD_URL || MOCK_URL;

/**
 * Returns the headers for authentication.
 */
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
  'Content-Type': 'application/json',
});

/**
 * Fetches posts for a subject by subjectId.
 * @param {string} subjectId - The ID of the subject.
 * @param {Object} [options] - Optional query parameters.
 * @param {string} [options.postType] - Filter by post type.
 * @param {number} [options.limit] - Limit of posts.
 * @param {number} [options.offset] - Offset for pagination.
 * @returns {Promise<PostResponse[]>} Array of posts.
 * @throws {Error} If network request fails.
 */
export async function fetchSubjectPosts(
  subjectId: string,
  options?: { postType?: string; limit?: number; offset?: number }
): Promise<PostResponse[]> {
  const params = new URLSearchParams();
  if (options?.postType) params.append('postType', options.postType);
  if (options?.limit) params.append('limit', String(options.limit));
  if (options?.offset) params.append('offset', String(options.offset));
  const url = `${BASE_URL}/subjects/${subjectId}/posts${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Network error');
  return await res.json();
}

/**
 * Publishes a new post for a subject (supports file upload).
 * @param {string} subjectId - The ID of the subject.
 * @param {Object} data - Post data.
 * @param {string} [data.PostType] - Type of the post.
 * @param {string} [data.Content] - Content of the post.
 * @param {File} [data.File] - Optional file.
 * @returns {Promise<PostResponse>} Created post.
 * @throws {Error} If network request fails.
 */
export async function publishSubjectPost(
  subjectId: string,
  data: { PostType?: string; Content?: string; File?: File }
): Promise<PostResponse> {
  const formData = new FormData();
  if (data.PostType) formData.append('PostType', data.PostType);
  if (data.Content) formData.append('Content', data.Content);
  if (data.File) formData.append('File', data.File);
  const res = await fetch(`${BASE_URL}/subjects/${subjectId}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
    },
    body: formData,
  });
  if (!res.ok) throw new Error('Network error');
  return await res.json();
}

/**
 * Publishes a new assignment post for a subject (supports file upload and assignment data).
 * @param {string} subjectId - The ID of the subject.
 * @param {Object} data - Assignment post data.
 * @param {string} [data.Content] - Content/title of the assignment post.
 * @param {string} [data.AssignmentData] - Assignment-specific data (JSON string).
 * @param {File} [data.File] - Optional file.
 * @returns {Promise<PostResponse>} Created assignment post.
 * @throws {Error} If network request fails.
 */
export async function publishAssignmentPost(
  subjectId: string,
  data: { Content?: string; AssignmentData?: string; File?: File }
): Promise<PostResponse> {
  const formData = new FormData();
  formData.append('PostType', 'Assignment');
  if (data.Content) formData.append('Content', data.Content);
  if (data.AssignmentData) formData.append('AssignmentData', data.AssignmentData);
  if (data.File) formData.append('File', data.File);
  const res = await fetch(`${BASE_URL}/subjects/${subjectId}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
    },
    body: formData,
  });
  if (!res.ok) throw new Error('Network error');
  return await res.json();
}

/**
 * Fetches comments for a given post.
 * @param {string} postId - The ID of the post.
 * @param {Object} [options] - Optional query parameters.
 * @param {string} [options.targetType] - Type of the target (default: 'post').
 * @param {number} [options.limit] - Limit of comments.
 * @param {number} [options.offset] - Offset for pagination.
 * @returns {Promise<CommentResponse[]>} Array of comments.
 * @throws {Error} If network request fails.
 */
export async function fetchPostComments(
  postId: string,
  options?: { targetType?: string; limit?: number; offset?: number }
): Promise<CommentResponse[]> {
  const params = new URLSearchParams();
  params.append('targetId', postId);
  params.append('targetType', options?.targetType || 'Post');
  if (options?.limit) params.append('limit', String(options.limit));
  if (options?.offset) params.append('offset', String(options.offset));
  const url = `${BASE_URL}/comments?${params.toString()}`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Network error');
  return await res.json();
}

/**
 * Adds a comment to a post.
 * @param {string} postId - The ID of the post.
 * @param {string} text - Comment text.
 * @param {string} [targetType] - Type of the target (default: 'post').
 * @returns {Promise<CommentResponse>} Created comment.
 * @throws {Error} If network request fails.
 */
export async function addPostComment(
  postId: string,
  text: string,
  targetType: string = 'Post'
): Promise<CommentResponse> {
  const res = await fetch(`${BASE_URL}/comments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ targetType, targetId: postId, text }),
  });
  if (!res.ok) throw new Error('Network error');
  return await res.json();
}

/**
 * Downloads the file attached to a post by its postId using the /api/posts/{postId}/file endpoint.
 *
 * @param {string} postId - The unique identifier of the post.
 * @returns {Promise<Blob>} - Returns a promise that resolves to the file Blob.
 * @throws {Error} - Throws an error if the request fails or the file is not found.
 */
export async function downloadPostFile(postId: string): Promise<Blob> {
  const res = await fetch(`${BASE_URL}/posts/${postId}/file`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
    },
  });
  if (!res.ok) throw new Error('Failed to download file');
  return await res.blob();
}

/**
 * Creates a new assignment for a subject.
 * @param {string} subjectId - The ID of the subject.
 * @param {UpsertAssignmentRequest} request - Assignment creation data.
 * @returns {Promise<AssignmentResponse>} Created assignment.
 * @throws {Error} If network request fails.
 */
export async function createAssignment(
  subjectId: string,
  request: import('@/types/subject/AssignmentCreate').UpsertAssignmentRequest
): Promise<import('@/types/subject/FeedTypes').AssignmentResponse> {
  const res = await fetch(`${BASE_URL}/subjects/${subjectId}/assignments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error('Network error');
  return await res.json();
}
