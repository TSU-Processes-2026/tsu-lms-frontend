import { useEffect, useState, useRef, useCallback } from 'react';
import { PostResponse, CommentResponse } from '@/types/subject/FeedTypes';
import {
  fetchSubjectPosts,
  fetchPostComments,
  publishSubjectPost,
  addPostComment
} from '@/api/subject/subjectView';

/**
 * Interface representing the subject feed hook return value.
 *
 * @property {PostResponse[]} posts - Array of posts.
 * @property {Record<string, CommentResponse[]>} comments - Comments grouped by postId.
 * @property {boolean} loading - Loading state.
 * @property {string | null} error - Error message.
 * @property {function} publishPost - Handler to publish a new post.
 * @property {function} addComment - Handler to add a comment to a post.
 */
export interface UseSubjectFeed {
  posts: PostResponse[];
  comments: Record<string, CommentResponse[]>;
  loading: boolean;
  error: string | null;
  publishPost: (post: { PostType?: string; Content?: string; File?: File }) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  refreshFeed: () => Promise<void>;
}

/**
 * useSubjectFeed hook for fetching posts and comments from mock server.
 * Provides business logic for subject feed: loading, error, data, publish, comment.
 *
 * @param {string} subjectId - ID of the subject.
 * @returns {UseSubjectFeed} Feed state and handlers.
 * @throws {Error} Network error if fetch fails.
 */
export function useSubjectFeed(subjectId: string): UseSubjectFeed {
  const [state, setState] = useState<{
    posts: PostResponse[];
    comments: Record<string, CommentResponse[]>;
    loading: boolean;
    error: string | null;
  }>({
    posts: [],
    comments: {},
    loading: true,
    error: null,
  });

  const isMounted = useRef(true);
  const fetchFeed = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const postsData: PostResponse[] = await fetchSubjectPosts(subjectId);
      const commentsResults = await Promise.all(
        postsData.map(async (post) => {
          const comments = await fetchPostComments(post.id);
          return { postId: post.id, comments };
        })
      );
      if (!isMounted.current) return;
      const grouped: Record<string, CommentResponse[]> = {};
      commentsResults.forEach(r => { grouped[r.postId] = r.comments; });
      setState({
        posts: postsData,
        comments: grouped,
        loading: false,
        error: null,
      });
    } catch {
      if (!isMounted.current) return;
      setState({
        posts: [],
        comments: {},
        loading: false,
        error: 'Ошибка загрузки ленты',
      });
    }
  }, [subjectId]);

  useEffect(() => {
    isMounted.current = true;
    Promise.resolve().then(fetchFeed);
    return () => {
      isMounted.current = false;
    };
  }, [subjectId, fetchFeed]);

  const refreshFeed = async () => {
    await fetchFeed();
  };

  /**
   * Publishes a new post to the subject feed.
   *
   * @param {Object} post - Post data to publish.
   * @param {string} [post.PostType] - Type of the post (announcement, material, assignment).
   * @param {string} [post.Content] - Content of the post.
   * @param {File} [post.File] - Optional file attachment.
   * @returns {Promise<void>} Promise resolving when post is published.
   * @throws {Error} If publishing fails.
   */
  const publishPost = async (post: { PostType?: string; Content?: string; File?: File }): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const newPost: PostResponse = await publishSubjectPost(subjectId, post);
      setState(prev => ({
        ...prev,
        posts: [newPost, ...prev.posts],
        loading: false,
      }));
    } catch {
      setState(prev => ({ ...prev, loading: false, error: 'Ошибка публикации поста' }));
    }
  };

  const addComment = async (postId: string, text: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const newComment: CommentResponse = await addPostComment(postId, text);
      setState(prev => ({
        ...prev,
        comments: {
          ...prev.comments,
          [postId]: [...(prev.comments[postId] || []), newComment],
        },
        loading: false,
      }));
    } catch {
      setState(prev => ({ ...prev, loading: false, error: 'Ошибка добавления комментария' }));
    }
  };
  
  return {
    posts: state.posts,
    comments: state.comments,
    loading: state.loading,
    error: state.error,
    publishPost,
    addComment,
    refreshFeed,
  };
}
