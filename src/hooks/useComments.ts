/**
 * useComments hook manages business logic for comments section.
 *
 * Provides state and handlers for:
 * - Comments array
 * - Composer text
 * - Adding new comment
 *
 * @param initialComments Initial array of comments.
 * @returns Object with comments, composerText, setComposerText, handleComment.
 */
import { useState } from 'react';
import { CommentItem } from '@/components/ui/CommentSection';

export function useComments(initialComments: CommentItem[] = []) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [composerText, setComposerText] = useState('');

  /**
   * Adds a new comment to the comments array.
   * Ignores empty input.
   * @throws Does not throw.
   */
  const handleComment = () => {
    if (!composerText.trim()) return;
    setComments([
      ...comments,
      {
        id: 'c' + Date.now(),
        author: 'Вы',
        text: composerText,
        avatar: 'В',
        date: 'Только что',
      },
    ]);
    setComposerText('');
  };

  return {
    comments,
    composerText,
    setComposerText,
    handleComment,
  };
}
