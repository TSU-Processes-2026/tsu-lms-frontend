import { useEffect, useState } from 'react';
import { PostResponse, CommentResponse } from '@/types/subject/FeedTypes';
import {
  fetchSubjectPosts,
  fetchPostComments,
  publishSubjectPost,
  addPostComment
} from '@/api/subject/subjectView';

export interface UseSubjectFeed {
  posts: PostResponse[];
  comments: Record<string, CommentResponse[]>;
  loading: boolean;
  error: string | null;
  publishPost: (post: Omit<PostResponse, 'id' | 'createdAt' | '$type'>) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
}

/**
 * useSubjectFeed hook for fetching posts and comments from mock server.
 * Provides business logic for subject feed: loading, error, data, publish, comment.
 *
 * @param {string} subjectId - ID of the subject.
 * @returns {Object} Feed state and handlers.
 * @property {PostResponse[]} posts - Array of posts.
 * @property {Record<string, CommentResponse[]>} comments - Comments grouped by postId.
 * @property {boolean} loading - Loading state.
 * @property {string | null} error - Error message.
 * @property {function} publishPost - Handler to publish a new post.
 * @property {function} addComment - Handler to add a comment to a post.
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

  useEffect(() => {
    let isMounted = true;

    async function fetchFeed() {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const postsData: PostResponse[] = await fetchSubjectPosts(subjectId);
        const commentsResults = await Promise.all(
          postsData.map(async (post) => {
            const comments = await fetchPostComments(post.id);
            return { postId: post.id, comments };
          })
        );
        if (!isMounted) return;
        const grouped: Record<string, CommentResponse[]> = {};
        commentsResults.forEach(r => { grouped[r.postId] = r.comments; });
        setState({
          posts: postsData,
          comments: grouped,
          loading: false,
          error: null,
        });
      } catch {
        if (!isMounted) return;
        setState({
          posts: [],
          comments: {},
          loading: false,
          error: 'Ошибка загрузки ленты',
        });
      }
    }

    void fetchFeed();

    return () => {
      isMounted = false;
    };
  }, [subjectId]);

  const publishPost = async (post: Omit<PostResponse, 'id' | 'createdAt' | '$type'>) => {
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
  };
}
