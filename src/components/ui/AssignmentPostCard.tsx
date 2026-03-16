import React, {JSX} from 'react';
import { ClipboardCheck, HelpCircle } from 'lucide-react';
import { AssignmentPostResponse, AssignmentResponse } from '@/types/subject/FeedTypes';
import CommentSection from './CommentSection';
import { formatPostDate } from '@/utils/formatPostDate';
import { useSubjectView } from '@/hooks/subject/useSubjectView';

/**
 * AssignmentPostCardData extends AssignmentPostResponse with authorUsername.
 * Used for post prop in AssignmentPostCard to eliminate TS2339 error.
 */
type AssignmentPostCardData = AssignmentPostResponse & { authorUsername: string };

/**
 * AssignmentPostCardProps defines the properties for AssignmentPostCard component.
 * @property post Assignment post object returned from API, extended with authorUsername.
 * @property assignment Assignment object returned from API if available.
 */
type AssignmentPostCardProps = {
  post: AssignmentPostCardData;
  assignment?: AssignmentResponse;
};

/**
 * AssignmentPostCard component displays assignment post and handles opening assignment test.
 * Business logic for opening assignment is delegated to useSubjectView hook.
 *
 * @param {AssignmentPostCardProps} props - Assignment post and assignment data.
 * @returns {JSX.Element} Assignment post card UI.
 */
const AssignmentPostCard: React.FC<AssignmentPostCardProps> = ({ post, assignment }: AssignmentPostCardProps): JSX.Element => {
  const { handleOpenAssignment } = useSubjectView();

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-all">
      <div className="p-6">
        <div className="flex gap-4 mb-4">
          <div className="w-11 h-11 rounded-full bg-linear-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
            <ClipboardCheck size={22} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-800">{post.authorUsername}</p>
            <p className="text-xs text-slate-400 mt-1">{formatPostDate(post.createdAt)}</p>
          </div>
        </div>
        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Новое задание</span>
        <h3 className="text-xl font-bold text-slate-800 mt-1 mb-4">{post.content}</h3>
        {assignment && (
          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <HelpCircle className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{assignment.questions.length} вопросов</p>
              </div>
            </div>
            <button onClick={() => handleOpenAssignment(assignment)}
              className="bg-linear-to-r from-purple-600 to-purple-700 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-md hover:-translate-y-0.5 transition-all">
              Пройти тест
            </button>
          </div>
        )}
      </div>
      <CommentSection postId={post.id} />
    </div>
  );
};

export default AssignmentPostCard;
