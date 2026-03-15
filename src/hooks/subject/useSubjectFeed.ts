import { useEffect, useState } from 'react';
import { Post, Comment } from '@/types/subject/FeedTypes';

export interface UseSubjectFeed {
  posts: Post[];
  comments: Record<string, Comment[]>;
  loading: boolean;
  error: string | null;
  publishPost: (post: Omit<Post, 'id' | 'createdAt'>) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
}

/**
 * useSubjectFeed hook for fetching posts and comments from mock server.
 * Provides business logic for subject feed: loading, error, data, publish, comment.
 *
 * @param {string} subjectId - ID of the subject.
 * @returns {Object} Feed state and handlers.
 * @property {Post[]} posts - Array of posts.
 * @property {Record<string, Comment[]>} comments - Comments grouped by postId.
 * @property {boolean} loading - Loading state.
 * @property {string | null} error - Error message.
 * @property {function} publishPost - Handler to publish a new post.
 * @property {function} addComment - Handler to add a comment to a post.
 */
export function useSubjectFeed(subjectId: string): UseSubjectFeed {
  const [state, setState] = useState<{
    posts: Post[];
    comments: Record<string, Comment[]>;
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
        const postsRes = await fetch(`/api/subjects/${subjectId}/posts`);
        if (!postsRes.ok) throw new Error('Ошибка сети');
        const postsData: Post[] = await postsRes.json();

        const commentsResults = await Promise.all(
            postsData.map(post =>
                fetch(`/api/comments?targetId=${post.id}`)
                    .then(res => res.json())
                    .then((comments: Comment[]) => ({ postId: post.id, comments }))
            )
        );

        if (!isMounted) return;

        const grouped: Record<string, Comment[]> = {};
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

  const publishPost = async (post: Omit<Post, 'id' | 'createdAt'>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`/api/subjects/${subjectId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      const newPost: Post = await res.json();
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
      const res = await fetch(`/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'post', targetId: postId, text }),
      });
      const newComment: Comment = await res.json();
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
