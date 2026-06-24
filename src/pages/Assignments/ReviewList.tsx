import React, { useState, useEffect } from 'react';
import { ClipboardList, Clock, AlertCircle, CheckCircle2, XCircle, ArrowRight, Eye } from 'lucide-react';
import { ReviewAssignmentDto, ReviewStatus } from '@/types/assignments/reviews';
import { DEV_URL, MOCK_URL, PROD_URL } from '@/constants/config/config';
import { ACCESS_TOKEN } from '@/constants/auth/auth';

interface ReviewListProps {
    onStartReview: (assignment: ReviewAssignmentDto) => void;
    onViewReview: (assignment: ReviewAssignmentDto) => void;
    onContinueReview: (assignment: ReviewAssignmentDto) => void;
    subjectId?: string;
}

const STATUS_CONFIG: Record<ReviewStatus, { label: string; bg: string; text: string }> = {
    pending: { label: 'Ожидает', bg: 'bg-slate-200', text: 'text-slate-700' },
    opened: { label: 'В процессе', bg: 'bg-blue-100', text: 'text-blue-700' },
    submitted: { label: 'Завершена', bg: 'bg-emerald-100', text: 'text-emerald-700' },
    expired: { label: 'Просрочена', bg: 'bg-red-100', text: 'text-red-700' },
    cancelled: { label: 'Отменена', bg: 'bg-slate-100', text: 'text-slate-500' },
};

const getTimeRemaining = (dueAt?: string): string => {
    if (!dueAt) return '';
    const diff = new Date(dueAt).getTime() - Date.now();
    if (diff <= 0) return 'Просрочено';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}ч ${mins}м`;
};

const StatusBadge: React.FC<{ status: ReviewStatus }> = ({ status }) => {
    const config = STATUS_CONFIG[status];
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
            {config.label}
        </span>
    );
};

export const ReviewList: React.FC<ReviewListProps> = ({
    onStartReview,
    onViewReview,
    onContinueReview,
    subjectId,
}) => {
    const API_BASE = DEV_URL || PROD_URL || MOCK_URL;
    const [reviews, setReviews] = useState<ReviewAssignmentDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            const token = localStorage.getItem(ACCESS_TOKEN);
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const url = subjectId
                    ? `${API_BASE}/reviews/me?subjectId=${subjectId}`
                    : `${API_BASE}/reviews/me`;
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data: ReviewAssignmentDto[] = await res.json();
                    setReviews(Array.isArray(data) ? data : []);
                }
            } catch {
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [API_BASE, subjectId]);

    if (loading) {
        return (
            <div className='bg-white rounded-3xl p-6 shadow-lg border border-slate-100'>
                <div className='text-center text-slate-400 py-8'>Загрузка...</div>
            </div>
        );
    }

    return (
        <div className='bg-white rounded-3xl p-6 shadow-lg border border-slate-100'>
            <div className='flex items-center gap-3 mb-6'>
                <div className='w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md'>
                    <ClipboardList size={20} />
                </div>
                <h3 className='font-bold text-slate-800 text-xl'>Мои проверки</h3>
                <span className='ml-auto px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600'>
                    {reviews.length}
                </span>
            </div>

            {reviews.length === 0 ? (
                <div className='text-center py-10'>
                    <CheckCircle2 size={48} className='mx-auto text-slate-200 mb-4' />
                    <p className='text-slate-400 font-medium'>Нет назначенных проверок</p>
                </div>
            ) : (
                <div className='space-y-3'>
                    {reviews.map((review) => {
                        const timeLeft = getTimeRemaining(review.dueAt);
                        const isExpired = review.status === 'expired';
                        const isCancelled = review.status === 'cancelled';
                        const isSubmitted = review.status === 'submitted';
                        const isOpened = review.status === 'opened';
                        const isPending = review.status === 'pending';
                        const hasTimeWarning = !isExpired && !isCancelled && !isSubmitted && timeLeft !== '';

                        return (
                            <div
                                key={review.id}
                                className={`border border-slate-100 rounded-2xl p-4 hover:shadow-md transition-all ${
                                    isCancelled ? 'opacity-60' : ''
                                }`}
                            >
                                <div className='flex items-start justify-between gap-4'>
                                    <div className='flex-1 min-w-0'>
                                        <h4
                                            className={`font-bold text-slate-800 mb-2 ${
                                                isCancelled ? 'line-through' : ''
                                            }`}
                                        >
                                            {review.taskTitle}
                                        </h4>
                                        <div className='flex flex-wrap items-center gap-2 mb-1'>
                                            <StatusBadge status={review.status} />
                                            {hasTimeWarning && (
                                                <span className='flex items-center gap-1 text-xs text-amber-600 font-medium'>
                                                    <Clock size={12} />
                                                    {timeLeft}
                                                </span>
                                            )}
                                            {isExpired && !isSubmitted && (
                                                <span className='flex items-center gap-1 text-xs text-red-600 font-medium'>
                                                    <AlertCircle size={12} />
                                                    Время истекло
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className='shrink-0 flex flex-col gap-2 items-end'>
                                        {isPending && (
                                            <button
                                                onClick={() => onStartReview(review)}
                                                className='flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm'
                                            >
                                                Начать проверку
                                                <ArrowRight size={14} />
                                            </button>
                                        )}
                                        {isOpened && (
                                            <button
                                                onClick={() => onContinueReview(review)}
                                                className='flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm'
                                            >
                                                Продолжить
                                                <ArrowRight size={14} />
                                            </button>
                                        )}
                                        {isSubmitted && (
                                            <button
                                                onClick={() => onViewReview(review)}
                                                className='flex items-center gap-1.5 px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300 transition-colors'
                                            >
                                                Просмотр
                                                <Eye size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
