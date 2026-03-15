import React from 'react';
import { User as UserIcon, Bell } from 'lucide-react';
import { AnnouncementPostResponse } from '@/types/subject/FeedTypes';
import CommentSection from './CommentSection';
import { formatPostDate } from '@/utils/formatPostDate';

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
              <p className="text-xs text-slate-400 mt-1">{formatPostDate(post.createdAt)}</p>
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
      <CommentSection />
    </div>
  );
};

export default AnnouncementPostCard;
