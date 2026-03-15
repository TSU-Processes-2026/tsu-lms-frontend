import React, { useState } from 'react';
import { FileText, Download, User as UserIcon } from 'lucide-react';
import { Post } from '@/types/subject/FeedTypes';

/**
 * MaterialPostCard component displays a material post with comments and comment composer.
 *
 * Displays material post with author, creation date, content, download block, comments and comment input.
 *
 * @param post Material post object.
 * @returns JSX.Element Material post card element.
 */
type MaterialPostCardProps = {
  post: Post;
};

const MaterialPostCard: React.FC<MaterialPostCardProps> = ({ post }) => {
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
        <div className="flex gap-4 mb-4">
          <div className="w-11 h-11 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
            <FileText size={22} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-800">{post.authorId}</p>
            <p className="text-xs text-slate-400 mt-1">{post.createdAt}</p>
          </div>
        </div>
        {/* Блок для скачивания файла */}
        <div className="mt-5 p-5 border border-slate-100 rounded-2xl bg-linear-to-br from-slate-50 to-slate-100/50 flex items-center justify-between hover:border-blue-200 cursor-pointer transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl shadow-md"><FileText className="text-blue-500" size={24} /></div>
            <div>
              <span className="font-semibold text-slate-800">{post.content}</span>
              <p className="text-xs text-slate-400 mt-1">{post.fileSize}</p>
            </div>
          </div>
          <button className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"><Download size={18} /></button>
        </div>
      </div>
      {/* Блок комментариев */}
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
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialPostCard;
