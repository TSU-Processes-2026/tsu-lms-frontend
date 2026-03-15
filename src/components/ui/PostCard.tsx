import React from 'react';
import { Post, AssignmentQuestion, Comment } from '@/types/subject/FeedTypes';
import { User as UserIcon, Bell, FileText, ClipboardCheck, Download, Edit, Send } from 'lucide-react';

/**
 * Component for displaying a single post in the subject feed.
 * Supports announcement, material, and assignment post types.
 *
 * @param {Post} post - Post object to display.
 * @param {string} authorName - Name of the post author.
 * @param {string} date - Date string for the post.
 * @param {Comment[]} comments - Array of comments for the post.
 * @param {function} onEdit - Handler for editing the post.
 * @param {function} onDownload - Handler for downloading attached file.
 * @param {function} onAddComment - Handler for adding a comment.
 * @returns {JSX.Element} PostCard component.
 */
interface PostCardProps {
  post: Post;
  authorName: string;
  date: string;
  comments: Comment[];
  onEdit?: () => void;
  onDownload?: () => void;
  onAddComment?: (text: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, authorName, date, comments, onEdit, onDownload, onAddComment }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-all">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-4">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg ${
              post.postType === 'announcement' ? 'bg-linear-to-br from-amber-400 to-amber-600' :
              post.postType === 'material' ? 'bg-linear-to-br from-blue-400 to-blue-600' :
              'bg-linear-to-br from-purple-400 to-purple-600'
            }`}>
              {post.postType === 'announcement' && <Bell size={22} className="text-white" />}
              {post.postType === 'material' && <FileText size={22} className="text-white" />}
              {post.postType === 'assignment' && <ClipboardCheck size={22} className="text-white" />}
            </div>
            <div>
              <p className="font-bold text-slate-800">{authorName}</p>
              <p className="text-xs text-slate-400 mt-1">{date}</p>
            </div>
          </div>
          {onEdit && (
            <button onClick={onEdit} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
              <Edit size={18} />
            </button>
          )}
        </div>

        {/* Content for assignment, material, or announcement */}
        {post.postType === 'assignment' ? (
          <div>
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Новое задание</span>
            <h3 className="text-xl font-bold text-slate-800 mt-1 mb-2">{post.content}</h3>
            {/* Questions */}
            {post.questions && post.questions.length > 0 && (
              <div className="mt-4">
                <p className="font-bold text-slate-800 text-sm mb-2">Вопросы:</p>
                <ul className="list-disc ml-6">
                  {post.questions.map((q: AssignmentQuestion) => (
                    <li key={q.id} className="mb-1">
                      <span className="font-semibold">{q.questionType}:</span> {q.questionData}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-slate-800 mb-3">{post.content}</h3>
            {post.postType === 'material' && post.fileName && (
              <div className="mt-5 p-5 border border-slate-100 rounded-2xl bg-linear-to-br from-slate-50 to-slate-100/50 flex items-center justify-between hover:border-blue-200 cursor-pointer transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-md"><FileText className="text-blue-500" size={24} /></div>
                  <div>
                    <span className="font-semibold text-slate-800">{post.fileName}</span>
                    <p className="text-xs text-slate-400 mt-1">{post.fileSize ? `${post.fileSize} bytes` : ''}</p>
                  </div>
                </div>
                {onDownload && (
                  <button className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all" onClick={onDownload}><Download size={18} /></button>
                )}
              </div>
            )}
          </>
        )}
      </div>
      {/* Comments */}
      <div className="bg-slate-50 border-t border-slate-100 p-5 space-y-3">
        {comments.map(c => (
          <div key={c.id} className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-slate-200 to-slate-300 shadow-sm flex items-center justify-center text-xs font-bold shrink-0 text-slate-600">
              <UserIcon size={16} className="text-slate-600" />
            </div>
            <div className="flex-1 bg-white p-3 rounded-2xl shadow-sm">
              <span className="font-bold text-slate-800 text-sm mr-2">{c.authorId}</span>
              <span className="text-slate-600 text-sm">{c.text}</span>
            </div>
          </div>
        ))}
        <div className="flex gap-3 items-center pt-1">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-400 to-blue-600 shadow-lg flex items-center justify-center shrink-0">
            <UserIcon size={16} className="text-white" />
          </div>
          <div className="flex-1 relative">
            <input placeholder="Написать комментарий..." className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 pr-12 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm transition-all" />
            {onAddComment && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 transition-all" onClick={() => onAddComment('') /* Передать текст комментария */}>
                <Send size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
