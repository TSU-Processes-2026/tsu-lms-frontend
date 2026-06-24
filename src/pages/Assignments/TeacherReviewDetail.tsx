import React, { useEffect, useState, useCallback } from 'react';
import {
    X, User, Star, ThumbsDown, RefreshCw, Edit3, Download,
    ChevronDown, ChevronUp, Clock, Send, Save, MessageSquare, ClipboardCheck,
} from 'lucide-react';
import { DEV_URL, PROD_URL, MOCK_URL } from '@/constants/config/config';
import { ACCESS_TOKEN } from '@/constants/auth/auth';
import { PeerReviewDto, ReviewSource } from '@/types/assignments/reviews';
import { Criterion, CriterionResult, AssessmentType } from '@/types/assignments/criteria';
import { CriterionAssessCard } from './CriterionAssessCard';
import { ManualGradeOverrideModal } from './ManualGradeOverrideModal';
import { Submission } from '@/types/assignments/assignments';

const API_BASE = DEV_URL || PROD_URL || MOCK_URL;

interface PeerReviewExtended extends PeerReviewDto {
    isRejected?: boolean;
    reviewerName?: string;
    overallScore?: number;
    overallComment?: string;
}

interface SubmissionReviewsResponse {
    peerReviews: PeerReviewExtended[];
    teacherReview?: PeerReviewExtended;
    finalGrade?: FinalGradeInfo;
}

interface FinalGradeInfo {
    finalScore?: number;
    finalSource?: ReviewSource | 'mixed';
    comment?: string;
}

interface SubmissionDetail {
    id: string;
    authorName?: string;
    authorId?: string;
    createdAt: string;
    submittedAt?: string;
    status: string;
    answers?: Record<string, any>;
    answerItems?: any[];
}

interface AssignmentInfo {
    id: string;
    content: string;
    questions?: any[];
    maxPoints?: number | null;
}

export interface TeacherReviewDetailProps {
    submissionId: string;
    assignmentId: string;
    courseId: string;
    onClose: () => void;
    onRecalculate: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
    RequiresReview: { label: 'На проверке', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    Graded: { label: 'Проверено', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    Draft: { label: 'Черновик', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
};

export const TeacherReviewDetail: React.FC<TeacherReviewDetailProps> = ({
    submissionId,
    assignmentId,
    courseId,
    onClose,
    onRecalculate,
}) => {
    const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
    const [assignment, setAssignment] = useState<AssignmentInfo | null>(null);
    const [reviews, setReviews] = useState<SubmissionReviewsResponse | null>(null);
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedPeer, setExpandedPeer] = useState<string | null>(null);
    const [expandedAnswers, setExpandedAnswers] = useState(false);
    const [showOverride, setShowOverride] = useState(false);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [recalculating, setRecalculating] = useState(false);
    const [exporting, setExporting] = useState(false);

    const [teacherScore, setTeacherScore] = useState('');
    const [teacherVerdict, setTeacherVerdict] = useState('');
    const [teacherSaving, setTeacherSaving] = useState(false);
    const [teacherComment, setTeacherComment] = useState('');
    const [comments, setComments] = useState<any[]>([]);

    const headers = useCallback(() => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        return {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        } as Record<string, string>;
    }, []);

    const fetchReviews = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/submissions/${submissionId}/reviews`, {
                headers: headers(),
            });
            if (res.ok) {
                const data: SubmissionReviewsResponse = await res.json();
                setReviews(data);

                if (data.teacherReview) {
                    setTeacherScore(data.teacherReview.overallScore?.toString() ?? '');
                    setTeacherVerdict(data.teacherReview.overallComment ?? '');
                }
            }
        } catch {
        }
    }, [submissionId, headers]);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            setError(null);

            try {
                const [subRes, assignRes, revRes, critRes] = await Promise.all([
                    fetch(`${API_BASE}/submissions/${submissionId}`, { headers: headers() }),
                    fetch(`${API_BASE}/assignments/${assignmentId}`, { headers: headers() }),
                    fetch(`${API_BASE}/submissions/${submissionId}/reviews`, { headers: headers() }),
                    fetch(`${API_BASE}/tasks/${assignmentId}/criteria`, { headers: headers() }),
                ]);

                if (subRes.ok) {
                    const subData: SubmissionDetail = await subRes.json();
                    setSubmission(subData);

                    try {
                        const commentsRes = await fetch(
                            `${API_BASE}/comments?targetType=Submission&targetId=${submissionId}&limit=100&offset=0`,
                            { headers: headers() },
                        );
                        if (commentsRes.ok) {
                            const commentsData = await commentsRes.json();
                            setComments(Array.isArray(commentsData) ? commentsData : []);
                        }
                    } catch {
                        setComments([]);
                    }
                }

                if (assignRes.ok) {
                    const assignData: AssignmentInfo = await assignRes.json();
                    setAssignment(assignData);
                }

                if (revRes.ok) {
                    const revData: SubmissionReviewsResponse = await revRes.json();
                    setReviews(revData);

                    if (revData.teacherReview) {
                        setTeacherScore(revData.teacherReview.overallScore?.toString() ?? '');
                        setTeacherVerdict(revData.teacherReview.overallComment ?? '');
                    }
                }

                if (critRes.ok) {
                    const critData = await critRes.json();
                    setCriteria(Array.isArray(critData) ? critData : critData.criteria ?? []);
                }
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [submissionId, assignmentId, headers]);

    const handleReject = async (reviewId: string) => {
        setRejectingId(reviewId);
        try {
            const res = await fetch(`${API_BASE}/reviews/${reviewId}/reject`, {
                method: 'POST',
                headers: headers(),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Ошибка при отклонении проверки');
            }
            await fetchReviews();
        } catch (err) {
            alert('Ошибка: ' + (err as Error).message);
        } finally {
            setRejectingId(null);
        }
    };

    const handleSaveTeacher = async () => {
        if (!teacherScore) return;
        const scoreValue = Number(teacherScore);
        if (!Number.isFinite(scoreValue) || scoreValue < 0) {
            alert('Укажите корректный балл');
            return;
        }

        setTeacherSaving(true);
        try {
            const res = await fetch(`${API_BASE}/submissions/${submissionId}/reviews/teacher`, {
                method: 'PUT',
                headers: headers(),
                body: JSON.stringify({
                    overallScore: scoreValue,
                    overallComment: teacherVerdict,
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Ошибка при сохранении оценки преподавателя');
            }

            await fetchReviews();
        } catch (err) {
            alert('Ошибка: ' + (err as Error).message);
        } finally {
            setTeacherSaving(false);
        }
    };

    const handleOverride = () => {
        setShowOverride(true);
    };

    const handleOverridden = () => {
        fetchReviews();
        onRecalculate();
    };

    const handleRecalculate = async () => {
        setRecalculating(true);
        try {
            const res = await fetch(
                `${API_BASE}/courses/${courseId}/recalculate?submissionId=${submissionId}`,
                { method: 'POST', headers: headers() },
            );
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Ошибка при пересчёте');
            }
            await fetchReviews();
            onRecalculate();
        } catch (err) {
            alert('Ошибка: ' + (err as Error).message);
        } finally {
            setRecalculating(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const res = await fetch(`${API_BASE}/courses/${courseId}/grades/export`, {
                headers: headers(),
            });
            if (!res.ok) return;
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `grades-${courseId}-${submissionId}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch {
        } finally {
            setExporting(false);
        }
    };

    const handleAddComment = async () => {
        if (!teacherComment.trim()) return;
        try {
            const res = await fetch(`${API_BASE}/comments`, {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify({
                    targetType: 'Submission',
                    targetId: submissionId,
                    text: teacherComment.trim(),
                }),
            });
            if (!res.ok) throw new Error('Ошибка при добавлении комментария');
            const created = await res.json();
            setComments((prev) => [...prev, created]);
            setTeacherComment('');
        } catch (err) {
            alert('Ошибка: ' + (err as Error).message);
        }
    };

    const formatValue = (fmt: string, v?: number): string => {
        if (v === undefined) return '—';
        if (fmt === 'checklist') return v ? 'Да' : 'Нет';
        if (fmt === 'percentage') return `${v}%`;
        if (fmt === 'boolean') return v ? 'Да' : 'Нет';
        return String(v);
    };

    const scoreColor = (score?: number): string => {
        if (score === undefined) return 'text-slate-400';
        if (score >= 80) return 'text-emerald-600';
        if (score >= 60) return 'text-blue-600';
        if (score >= 40) return 'text-amber-600';
        return 'text-red-600';
    };

    const sourceBadge = (source?: ReviewSource | 'mixed') => {
        if (source === 'teacher') {
            return { label: 'Teacher', bg: 'bg-blue-100', text: 'text-blue-700' };
        }
        if (source === 'mixed') {
            return { label: 'Mixed', bg: 'bg-purple-100', text: 'text-purple-700' };
        }
        return { label: 'Peer', bg: 'bg-emerald-100', text: 'text-emerald-700' };
    };

    if (loading) {
        return (
            <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
                <div className='absolute inset-0' onClick={onClose} />
                <div className='bg-white w-full max-w-4xl rounded-3xl shadow-2xl z-10 p-12 text-center'>
                    <div className='animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4' />
                    <p className='text-slate-500'>Загрузка проверок...</p>
                </div>
            </div>
        );
    }

    const submissionStatus = submission?.status ?? 'RequiresReview';
    const statusConfig = STATUS_CONFIG[submissionStatus] ?? STATUS_CONFIG.RequiresReview;

    const assignmentTitle = assignment?.content?.split('\n')[0] || 'Задание';
    const questions = assignment?.questions ?? [];

    const finalGrade = reviews?.finalGrade;
    const finalSource = finalGrade?.finalSource;
    const finalSourceCfg = sourceBadge(finalSource);
    const peerReviews = reviews?.peerReviews ?? [];
    const teacherReview = reviews?.teacherReview;

    const instructorResults = (submission as any)?.criterionResults?.filter(
        (r: CriterionResult) => r.assessmentType === 'INSTRUCTOR',
    ) ?? [];

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
            <div className='absolute inset-0' onClick={onClose} />
            <div className='bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden'>
                <div className='px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 shrink-0'>
                    <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-blue-500 to-blue-600'>
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className='text-xl font-bold text-slate-800'>
                                {submission?.authorName || 'Студент'}
                            </h3>
                            <p className='text-sm text-slate-500'>
                                {assignmentTitle} •{' '}
                                {new Date(submission?.createdAt || Date.now()).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className='flex items-center gap-3'>
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}
                        >
                            {statusConfig.label}
                        </span>
                        <button
                            onClick={onClose}
                            className='p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors'
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className='flex-1 overflow-y-auto p-8 space-y-8'>
                    {error && (
                        <div className='bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm font-medium'>
                            {error}
                        </div>
                    )}

                    {/* Section 1: Submission Info */}
                    <div>
                        <button
                            onClick={() => setExpandedAnswers(!expandedAnswers)}
                            className='flex items-center gap-2 font-bold text-slate-700 hover:text-blue-600 transition-colors mb-4'
                        >
                            <ClipboardCheck size={16} className='text-blue-500' />
                            Ответы студента
                            {expandedAnswers ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {expandedAnswers && (
                            <div className='space-y-4'>
                                {submission?.answers && typeof submission.answers === 'object' && !Array.isArray(submission.answers)
                                    ? Object.entries(submission.answers).map(([key, value]) => {
                                        const q = questions.find((q: any) => q.id === key);
                                        return (
                                            <div
                                                key={key}
                                                className='bg-slate-50 p-5 rounded-2xl border border-slate-100'
                                            >
                                                <h4 className='font-bold text-slate-800 mb-3'>
                                                    {q?.questionData || `Вопрос ${key}`}
                                                </h4>
                                                {q?.questionType === 'SingleChoice' && (
                                                    <p className='text-slate-600'>
                                                        <span className='font-semibold'>Ответ:</span>{' '}
                                                        {q?.options?.find((opt: any) => opt.id === value)?.text || String(value) || '—'}
                                                    </p>
                                                )}
                                                {q?.questionType === 'MultipleChoice' && (
                                                    <p className='text-slate-600'>
                                                        <span className='font-semibold'>Ответ:</span>{' '}
                                                        {(Array.isArray(value) ? value : [])
                                                            .map((id: string) => q?.options?.find((opt: any) => opt.id === id)?.text)
                                                            .filter(Boolean)
                                                            .join(', ') || '—'}
                                                    </p>
                                                )}
                                                {(q?.questionType === 'Text' || !q) && (
                                                    <div className='bg-white p-4 rounded-xl border border-slate-200'>
                                                        <p className='text-slate-700 whitespace-pre-wrap'>
                                                            {typeof value === 'string' ? value : JSON.stringify(value)}
                                                        </p>
                                                    </div>
                                                )}
                                                {q?.questionType === 'File' && (
                                                    <p className='text-slate-600'>
                                                        <span className='font-semibold'>Файл:</span>{' '}
                                                        {typeof value === 'object' ? value?.fileName || 'Загружен файл' : 'Загружен файл'}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })
                                    : submission?.answerItems && (
                                        <div className='space-y-3'>
                                            {submission.answerItems.map((item: any, idx: number) => (
                                                <div key={item.id || idx} className='bg-slate-50 p-4 rounded-xl border border-slate-100'>
                                                    <p className='text-xs font-semibold text-slate-400 uppercase mb-1'>Ответ {idx + 1}</p>
                                                    <p className='text-sm text-slate-700 whitespace-pre-wrap'>
                                                        {item.text || item.answer || JSON.stringify(item)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                {(!submission?.answers || Object.keys(submission.answers).length === 0) && !submission?.answerItems && (
                                    <p className='text-sm text-slate-400 text-center py-4'>Нет данных ответа</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Section 2: Peer Reviews */}
                    <div>
                        <h4 className='font-bold text-slate-700 mb-4 flex items-center gap-2'>
                            <User size={16} className='text-blue-500' /> Список проверок
                        </h4>
                        {peerReviews.length === 0 ? (
                            <div className='bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center'>
                                <p className='text-slate-400 font-medium'>Нет peer-оценок</p>
                            </div>
                        ) : (
                            <div className='space-y-3'>
                                {peerReviews.map((review) => {
                                    const isExpanded = expandedPeer === review.id;
                                    const isRejected = review.isRejected;
                                    const reviewCriterionResults = (review as any).criterionResults ?? [];
                                    return (
                                        <div
                                            key={review.id}
                                            className={`rounded-2xl border-2 p-5 transition-all ${
                                                isRejected
                                                    ? 'border-red-300 bg-red-50/30'
                                                    : 'border-slate-200 bg-white'
                                            }`}
                                        >
                                            <div className='flex items-start justify-between gap-4'>
                                                <div className='flex-1'>
                                                    <div className='flex items-center gap-3 mb-2'>
                                                        <div className='w-8 h-8 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold shrink-0'>
                                                            {review.reviewerName?.[0]?.toUpperCase() || 'P'}
                                                        </div>
                                                        <div>
                                                            <p className='font-bold text-slate-800'>
                                                                {review.reviewerName || 'Peer'}
                                                            </p>
                                                            <p className='text-xs text-slate-400'>
                                                                {new Date(review.submittedAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        {isRejected && (
                                                            <span className='px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700'>
                                                                Отклонена
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className='flex items-center gap-4 mt-3'>
                                                        <div className={`text-3xl font-black ${isRejected ? 'text-red-400 line-through' : scoreColor(review.overallScore)}`}>
                                                            {review.overallScore ?? '—'}
                                                        </div>
                                                        {review.overallComment && (
                                                            <p className='text-sm text-slate-600 line-clamp-2'>
                                                                {review.overallComment}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className='shrink-0 flex flex-col gap-2 items-end'>
                                                    <button
                                                        onClick={() =>
                                                            setExpandedPeer(isExpanded ? null : review.id)
                                                        }
                                                        className='flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all'
                                                    >
                                                        Показать критерии
                                                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(review.id)}
                                                        disabled={isRejected || rejectingId === review.id}
                                                        className='flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-300 text-red-600 hover:bg-red-50 transition-all disabled:opacity-50'
                                                    >
                                                        {rejectingId === review.id ? (
                                                            <svg className='animate-spin h-3 w-3' viewBox='0 0 24 24'>
                                                                <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' className='opacity-25' />
                                                                <path fill='currentColor' d='M4 12a8 8 0 018-8v8z' className='opacity-75' />
                                                            </svg>
                                                        ) : (
                                                            <ThumbsDown size={12} />
                                                        )}
                                                        {isRejected ? 'Отклонена' : 'Отклонить'}
                                                    </button>
                                                </div>
                                            </div>

                                            {isExpanded && reviewCriterionResults.length > 0 && (
                                                <div className='mt-4 pt-4 border-t border-slate-200 space-y-2'>
                                                    <p className='text-xs font-bold text-slate-500 uppercase tracking-wider mb-2'>Критерии peer-оценки</p>
                                                    {reviewCriterionResults.map((r: any) => {
                                                        const criterion = criteria.find((c) => c.id === r.criterionId);
                                                        if (!criterion) return null;
                                                        return (
                                                            <div
                                                                key={r.criterionId}
                                                                className={`border rounded-xl p-3 text-sm ${criterion.isBonus ? 'border-emerald-200 bg-emerald-50/20' : criterion.isPenalty ? 'border-red-200 bg-red-50/20' : 'border-slate-200 bg-slate-50'}`}
                                                            >
                                                                <div className='font-semibold text-slate-700'>{criterion.description}</div>
                                                                <div className='flex flex-wrap gap-2 mt-1 text-xs'>
                                                                    <span className='text-blue-600 font-bold'>
                                                                        {formatValue(criterion.format, r.value)}
                                                                    </span>
                                                                    {r.comment && (
                                                                        <span className='text-slate-500'>{r.comment}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            {isExpanded && reviewCriterionResults.length === 0 && (
                                                <div className='mt-4 pt-4 border-t border-slate-200'>
                                                    <p className='text-xs text-slate-400'>Критерии не заполнены</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Section 3: Teacher Assessment */}
                    <div className='bg-white rounded-2xl border border-slate-200 p-6'>
                        <h4 className='font-bold text-slate-800 mb-4 flex items-center gap-2'>
                            <Star size={16} className='text-blue-500' /> Оценка преподавателя
                        </h4>

                        {criteria.length > 0 && (
                            <div className='space-y-3 mb-6'>
                                {criteria.map((criterion) => {
                                    const instructor = instructorResults.find(
                                        (r: CriterionResult) => r.criterionId === criterion.id,
                                    );
                                    const self = (submission as any)?.criterionResults?.find(
                                        (r: CriterionResult) =>
                                            r.criterionId === criterion.id && r.assessmentType === 'SELF',
                                    );
                                    return (
                                        <CriterionAssessCard
                                            key={criterion.id}
                                            criterion={criterion}
                                            selfValue={self?.value}
                                            instructorValue={instructor?.value}
                                            instructorComment={instructor?.comment}
                                            onAssess={async (value, comment) => {
                                                try {
                                                    await fetch(
                                                        `${API_BASE}/submissions/${submissionId}/criteria`,
                                                        {
                                                            method: 'PUT',
                                                            headers: headers(),
                                                            body: JSON.stringify({
                                                                results: [{ criterionId: criterion.id, value, comment }],
                                                            }),
                                                        },
                                                    );
                                                } catch {
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        )}

                        <div className='grid grid-cols-2 gap-4 mb-4'>
                            <div>
                                <label className='text-sm font-semibold text-slate-600 mb-2 block'>
                                    Итоговый балл
                                </label>
                                <input
                                    type='number'
                                    value={teacherScore}
                                    onChange={(e) => setTeacherScore(e.target.value)}
                                    placeholder='0–100'
                                    min={0}
                                    max={100}
                                    className='w-full p-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors font-medium'
                                />
                            </div>
                            <div>
                                <label className='text-sm font-semibold text-slate-600 mb-2 block'>
                                    Процент
                                </label>
                                <div
                                    className={`p-3 rounded-xl font-bold text-xl text-center ${
                                        teacherScore
                                            ? 'bg-white border-2 border-blue-200 text-blue-700'
                                            : 'bg-slate-100 text-slate-400'
                                    }`}
                                >
                                    {teacherScore ? Math.round((+teacherScore / 100) * 100) : 0}%
                                </div>
                            </div>
                        </div>

                        <label className='text-sm font-semibold text-slate-600 mb-2 block'>
                            Вердикт / комментарий
                        </label>
                        <textarea
                            value={teacherVerdict}
                            onChange={(e) => setTeacherVerdict(e.target.value)}
                            rows={3}
                            placeholder='Напишите обратную связь для студента...'
                            className='w-full p-4 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors resize-none mb-4'
                        />

                        <button
                            onClick={handleSaveTeacher}
                            disabled={teacherSaving}
                            className='bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0'
                        >
                            {teacherSaving ? (
                                <>
                                    <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
                                        <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' className='opacity-25' />
                                        <path fill='currentColor' d='M4 12a8 8 0 018-8v8z' className='opacity-75' />
                                    </svg>
                                    Сохранение...
                                </>
                            ) : (
                                <>
                                    <Save size={16} /> Сохранить оценку
                                </>
                            )}
                        </button>
                    </div>

                    {/* Section 4: Final Grade */}
                    <div className='bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-2xl border border-violet-200 p-6'>
                        <h4 className='font-bold text-slate-800 mb-4 flex items-center gap-2'>
                            <Star size={16} className='text-violet-500' /> Итоговая оценка
                        </h4>

                        <div className='flex items-center gap-6 mb-6'>
                            <div>
                                <p className='text-sm text-slate-500 mb-1'>Текущий балл</p>
                                <div className='text-4xl font-black text-slate-800'>
                                    {finalGrade?.finalScore ?? teacherReview?.overallScore ?? '—'}
                                </div>
                            </div>
                            {finalSource && (
                                <span
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase ${finalSourceCfg.bg} ${finalSourceCfg.text}`}
                                >
                                    {finalSourceCfg.label}
                                </span>
                            )}
                            {!finalSource && teacherReview && (
                                <span className='px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-700'>
                                    Teacher
                                </span>
                            )}
                            {!finalSource && !teacherReview && (
                                <span className='px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-500'>
                                    Нет оценки
                                </span>
                            )}
                        </div>

                        <div className='flex flex-wrap gap-3'>
                            <button
                                onClick={handleOverride}
                                className='flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-lg hover:-translate-y-0.5 transition-all text-sm'
                            >
                                <Edit3 size={16} /> Переопределить оценку
                            </button>
                            <button
                                onClick={handleRecalculate}
                                disabled={recalculating}
                                className='flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-sm disabled:opacity-50'
                            >
                                {recalculating ? (
                                    <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
                                        <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' className='opacity-25' />
                                        <path fill='currentColor' d='M4 12a8 8 0 018-8v8z' className='opacity-75' />
                                    </svg>
                                ) : (
                                    <RefreshCw size={16} />
                                )}
                                Пересчитать
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={exporting}
                                className='flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-sm disabled:opacity-50'
                            >
                                {exporting ? (
                                    <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
                                        <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' className='opacity-25' />
                                        <path fill='currentColor' d='M4 12a8 8 0 018-8v8z' className='opacity-75' />
                                    </svg>
                                ) : (
                                    <Download size={16} />
                                )}
                                Экспорт CSV
                            </button>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className='bg-slate-50 rounded-2xl border border-slate-200 p-6'>
                        <h4 className='font-bold text-slate-800 mb-4 flex items-center gap-2'>
                            <MessageSquare size={16} className='text-slate-500' /> Комментарии к решению
                        </h4>
                        <div className='space-y-3 mb-4'>
                            {comments.length === 0 && (
                                <p className='text-sm text-slate-400 text-center py-4'>
                                    Пока нет комментариев
                                </p>
                            )}
                            {comments.map((c: any) => (
                                <div key={c.id} className='flex gap-3'>
                                    <div className='w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0'>
                                        {c.authorName?.[0]?.toUpperCase() || 'A'}
                                    </div>
                                    <div className='flex-1 bg-white p-3 rounded-xl border border-slate-200'>
                                        <div className='flex items-center gap-2 mb-1'>
                                            <span className='font-bold text-slate-800 text-sm'>
                                                {c.authorName || 'Автор'}
                                            </span>
                                            <span className='text-xs text-slate-400'>
                                                {new Date(c.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className='text-sm text-slate-600'>{c.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className='flex gap-3'>
                            <input
                                value={teacherComment}
                                onChange={(e) => setTeacherComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                placeholder='Добавить комментарий к решению...'
                                className='flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all'
                            />
                            <button
                                onClick={handleAddComment}
                                className='p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all'
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showOverride && reviews && (
                <ManualGradeOverrideModal
                    submissionId={submissionId}
                    currentScore={finalGrade?.finalScore ?? teacherReview?.overallScore}
                    currentSource={finalSource ?? (teacherReview ? 'teacher' : 'peer')}
                    onClose={() => setShowOverride(false)}
                    onOverridden={handleOverridden}
                />
            )}
        </div>
    );
};
