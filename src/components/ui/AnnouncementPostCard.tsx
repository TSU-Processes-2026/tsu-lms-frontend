import React, { useState } from 'react';
import { User as UserIcon, Bell, Send } from 'lucide-react';
import { AnnouncementPostResponse } from '@/types/subject/FeedTypes';

/**
 * AnnouncementPostCard component displays an announcement post.
 *
 * Displays announcement post with author, creation date, content and edit button.
 *
 * @param post Announcement post object.
 * @param userId Current user's ID.
 * @param userRole Current user's role.
 * @param onEditPost Callback for editing the post.
 * @returns JSX.Element Announcement post card element.
 */
/**
 * AnnouncementPostCardProps defines the properties for AnnouncementPostCard component.
 * @property post Announcement post object returned from API.
 * @property userId Current user's ID.
 * @property userRole Current user's role.
 * @property onEditPost Callback for editing the post.
 */
type AnnouncementPostCardProps = {
  post: AnnouncementPostResponse;
  userId: string;
  userRole: string;
  onEditPost: (post: AnnouncementPostResponse) => void;
};

/**
 * AnnouncementPostCard component displays an announcement post with comments and comment composer.
 *
 * Displays announcement post with author, creation date, content, edit button, comments and comment input.
 *
 * @param post Announcement post object.
 * @param userId Current user's ID.
 * @param userRole Current user's role.
 * @param onEditPost Callback for editing the post.
 * @returns JSX.Element Announcement post card element.
 */
const AnnouncementPostCard: React.FC<AnnouncementPostCardProps> = ({ post, userId, userRole, onEditPost }) => {
  const [comments, setComments] = useState<Array<{ id: string; author: string; text: string; avatar?: string; date: string }>>([]);
  const [composerText, setComposerText] = useState('');

  /**
   * Adds a new comment to the post.
   *
   * @throws Does not throw, silently ignores empty input.
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

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-all">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-4">
            <div className="w-11 h-11 rounded-full bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <Bell size={22} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-800">{post.authorId}</p>
              <p className="text-xs text-slate-400 mt-1">{post.createdAt}</p>
            </div>
          </div>
          {(userRole === 'admin' || userRole === 'teacher' || post.authorId === userId) && (
            <button onClick={() => onEditPost(post)}
              className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
              <UserIcon size={18} />
            </button>
          )}
        </div>
        <p className="text-slate-600 leading-relaxed">{post.content}</p>
      </div>
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
    </div>
  );
};

export default AnnouncementPostCard;
