import React from 'react';
import { Users, Clock, Eye, Shield, GitBranch } from 'lucide-react';

interface ReviewDistributionConfigProps {
    reviewEnabled: boolean;
    onReviewEnabledChange: (enabled: boolean) => void;
    reviewType: 'individual' | 'team';
    onReviewTypeChange: (type: 'individual' | 'team') => void;
    reviewMode: 'all_to_all' | 'pairs';
    onReviewModeChange: (mode: 'all_to_all' | 'pairs') => void;
    reviewDeadlineAt: string;
    onReviewDeadlineAtChange: (date: string) => void;
    reviewTimeLimitMinutes: number | undefined;
    onReviewTimeLimitMinutesChange: (mins: number | undefined) => void;
    criteriaVisibilityAt: string;
    onCriteriaVisibilityAtChange: (date: string) => void;
    teacherCanEditPeerScores: boolean;
    onTeacherCanEditPeerScoresChange: (val: boolean) => void;
    teamReviewPolicy: 'each_member_reviews' | 'one_representative_reviews';
    onTeamReviewPolicyChange: (policy: 'each_member_reviews' | 'one_representative_reviews') => void;
    disabled?: boolean;
}

const ReviewDistributionConfig: React.FC<ReviewDistributionConfigProps> = ({
    reviewEnabled,
    onReviewEnabledChange,
    reviewType,
    onReviewTypeChange,
    reviewMode,
    onReviewModeChange,
    reviewDeadlineAt,
    onReviewDeadlineAtChange,
    reviewTimeLimitMinutes,
    onReviewTimeLimitMinutesChange,
    criteriaVisibilityAt,
    onCriteriaVisibilityAtChange,
    teacherCanEditPeerScores,
    onTeacherCanEditPeerScoresChange,
    teamReviewPolicy,
    onTeamReviewPolicyChange,
    disabled = false,
}) => {
    return (
        <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
            {disabled && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 font-semibold">
                    Взаимное оценивание отключено на уровне курса
                </div>
            )}

            <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Shield size={16} className="text-blue-500" />
                    Включить взаимное оценивание
                </label>
                <button
                    type="button"
                    onClick={() => onReviewEnabledChange(!reviewEnabled)}
                    disabled={disabled}
                    className={`relative w-12 h-6 rounded-full transition-all ${reviewEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                    <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all shadow-sm ${reviewEnabled ? 'left-6' : 'left-0.5'}`} />
                </button>
            </div>

            {reviewEnabled && (
                <div className="border-t border-slate-200 pt-4 mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                                <Users size={14} /> Тип оценивания
                            </label>
                            <select
                                value={reviewType}
                                onChange={(e) => onReviewTypeChange(e.target.value as 'individual' | 'team')}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="individual">Индивидуальное</option>
                                <option value="team">Командное</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                                <GitBranch size={14} /> Режим распределения
                            </label>
                            <select
                                value={reviewMode}
                                onChange={(e) => onReviewModeChange(e.target.value as 'all_to_all' | 'pairs')}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="all_to_all">Все оценивают всех</option>
                                <option value="pairs">Оценивание в парах</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                                <Clock size={14} /> Дедлайн оценивания
                            </label>
                            <input
                                type="datetime-local"
                                value={reviewDeadlineAt}
                                onChange={(e) => onReviewDeadlineAtChange(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                                <Clock size={14} /> Лимит времени на проверку (мин)
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={reviewTimeLimitMinutes ?? ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    onReviewTimeLimitMinutesChange(val === '' ? undefined : Number(val));
                                }}
                                placeholder="Без ограничений"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                                <Eye size={14} /> Критерии видны с
                            </label>
                            <input
                                type="datetime-local"
                                value={criteriaVisibilityAt}
                                onChange={(e) => onCriteriaVisibilityAtChange(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        {reviewType === 'team' && (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                                    <Users size={14} /> Политика командного оценивания
                                </label>
                                <select
                                    value={teamReviewPolicy}
                                    onChange={(e) => onTeamReviewPolicyChange(e.target.value as 'each_member_reviews' | 'one_representative_reviews')}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option value="each_member_reviews">Каждый участник оценивает</option>
                                    <option value="one_representative_reviews">Один представитель оценивает</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                            <Shield size={14} /> Преподаватель может править оценки
                        </label>
                        <button
                            type="button"
                            onClick={() => onTeacherCanEditPeerScoresChange(!teacherCanEditPeerScores)}
                            className={`relative w-12 h-6 rounded-full transition-all ${teacherCanEditPeerScores ? 'bg-blue-600' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all shadow-sm ${teacherCanEditPeerScores ? 'left-6' : 'left-0.5'}`} />
                        </button>
                        <span className="text-sm text-slate-600">{teacherCanEditPeerScores ? 'Да' : 'Нет'}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewDistributionConfig;
