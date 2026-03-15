import React from 'react';
import { FileText, Download } from 'lucide-react';
import { Post } from '@/types/subject/FeedTypes';

/**
 * MaterialPostCard component displays a material post.
 *
 * Displays material post with author, creation date, content and download block.
 *
 * @param post Material post object.
 * @returns JSX.Element Material post card element.
 */
type MaterialPostCardProps = {
  post: Post;
};

const MaterialPostCard: React.FC<MaterialPostCardProps> = ({ post }) => {
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
        <h3 className="text-xl font-bold text-slate-800 mb-3">{post.content}</h3>
        <p className="text-slate-600 leading-relaxed">{post.content}</p>
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
    </div>
  );
};

export default MaterialPostCard;
