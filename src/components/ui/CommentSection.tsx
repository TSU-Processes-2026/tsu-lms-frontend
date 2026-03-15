/**
 * CommentSection component displays a list of comments and a composer for adding new comments.
 *
 * @param comments Initial array of comments.
 * @returns JSX.Element Comment section with comments and input.
 */
import React from 'react';
import { User as UserIcon, Send } from 'lucide-react';
import { useComments } from '@/hooks/useComments';

export interface CommentItem {
  id: string;
  author: string;
  text: string;
  avatar?: string;
  date: string;
}

interface CommentSectionProps {
  /**
   * Initial comments array.
   */
  initialComments?: CommentItem[];
}

const CommentSection: React.FC<CommentSectionProps> = ({ initialComments = [] }) => {
  const {
    comments,
    composerText,
    setComposerText,
    handleComment,
  } = useComments(initialComments);

  return (
    <div className="bg-slate-50 border-t border-slate-100 p-5 space-y-3">
      {comments.map(c => (
        <div key={c.id} className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-slate-200 to-slate-300 shadow-sm flex items-center justify-center text-xs font-bold shrink-0 text-slate-600">
            {c.avatar || c.author[0]}
          </div>
          <div className="flex-1 bg-white p-3 rounded-2xl shadow-sm">
            <span className="font-bold text-slate-800 text-sm mr-2">{c.author}</span>
            <span className="text-slate-600 text-sm">{c.text}</span>
          </div>
        </div>
      ))}
      <div className="flex gap-3 items-center pt-1">
        <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-400 to-blue-600 shadow-lg flex items-center justify-center shrink-0">
          <UserIcon size={16} className="text-white" />
        </div>
        <div className="flex-1 relative">
          <input value={composerText} onChange={e => setComposerText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleComment()}
            placeholder="Написать комментарий..."
            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 pr-12 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm transition-all" />
          <button onClick={handleComment}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 transition-all">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
