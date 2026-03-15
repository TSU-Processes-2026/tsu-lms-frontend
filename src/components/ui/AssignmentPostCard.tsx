import React from 'react';
import { ClipboardCheck, HelpCircle } from 'lucide-react';
import { Post } from '@/types/subject/FeedTypes';
import { Assignment } from '@/types/subject/FeedTypes';

/**
 * AssignmentPostCard component displays an assignment post.
 *
 * Displays assignment post with author, creation date, content, questions count and test button.
 *
 * @param post Assignment post object.
 * @param assignment Assignment object if available.
 * @param onOpenAssignment Callback for opening assignment.
 * @returns JSX.Element Assignment post card element.
 */
type AssignmentPostCardProps = {
  post: Post;
  assignment?: Assignment;
  onOpenAssignment: (assignment: Assignment) => void;
};

const AssignmentPostCard: React.FC<AssignmentPostCardProps> = ({ post, assignment, onOpenAssignment }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-all">
      <div className="p-6">
        <div className="flex gap-4 mb-4">
          <div className="w-11 h-11 rounded-full bg-linear-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
            <ClipboardCheck size={22} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-800">{post.authorId}</p>
            <p className="text-xs text-slate-400 mt-1">{post.createdAt}</p>
          </div>
        </div>
        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Новое задание</span>
        <h3 className="text-xl font-bold text-slate-800 mt-1 mb-2">{post.content}</h3>
        <p className="text-slate-600 leading-relaxed mb-4">{post.content}</p>
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
            <button onClick={() => onOpenAssignment(assignment)}
              className="bg-linear-to-r from-purple-600 to-purple-700 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-md hover:-translate-y-0.5 transition-all">
              Пройти тест
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentPostCard;
