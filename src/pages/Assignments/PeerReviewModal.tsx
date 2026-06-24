import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    X, Clock, Send, Save, AlertTriangle, CheckCircle, FileText, User,
} from 'lucide-react';
import { ReviewAssignmentDto } from '@/types/assignments/reviews';
import { Criterion, CriterionResult } from '@/types/assignments/criteria';
import { CriterionAssessCard } from './CriterionAssessCard';
import { DEV_URL, PROD_URL, MOCK_URL } from '@/constants/config/config';
import { ACCESS_TOKEN } from '@/constants/auth/auth';

const API_BASE = DEV_URL || PROD_URL || MOCK_URL;

interface PeerReviewModalProps {
    assignment: ReviewAssignmentDto;
    onClose: () => void;
    onSubmitted: () => void;
}

const formatTimeLeft = (dueAt?: string): { text: string; expired: boolean } => {
    if (!dueAt) return { text: '', expired: false };
    const diff = new Date(dueAt).getTime() - Date.now();
    if (diff <= 0) return { text: 'Время истекло', expired: true };
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (h > 0) return { text: `${h}ч ${m}м ${s}с`, expired: false };
    return { text: `${m}м ${s}с`, expired: false };
};

export const PeerReviewModal: React.FC<PeerReviewModalProps> = ({
    assignment,
    onClose,
    onSubmitted,
}) => {
    const [criterionValues, setCriterionValues] = useState<Record<string, number>>({});
    const [criterionComments, setCriterionComments] = useState<Record<string, string>>({});
    const [overallScore, setOverallScore] = useState<number | undefined>(undefined);
    const [overallComment, setOverallComment] = useState('');
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [submission, setSubmission] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [expired, setExpired] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const gradingModeRef = useRef<'five_point' | 'cumulative'>('five_point');
    const reviewId = assignment.id;

    const headers = useCallback(() => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        return {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        } as Record<string, string>;
    }, []);

    const buildPayload = useCallback(() => {
        return {
            overallScore,
            overallComment,
            criteriaResults: Object.keys(criterionValues).map((criterionId) => ({
                criterionId,
                value: criterionValues[criterionId],
                comment: criterionComments[criterionId] || '',
            })),
        };
    }, [overallScore, overallComment, criterionValues, criterionComments]);

    const saveDraft = useCallback(async () => {
        if (expired || submitted) return;
        try {
            setSaving(true);
            const res = await fetch(`${API_BASE}/reviews/${reviewId}/save-draft`, {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify(buildPayload()),
            });
            if (res.ok) {
                setShowSaved(true);
                setTimeout(() => setShowSaved(false), 2000);
            }
        } catch {
        } finally {
            setSaving(false);
        }
    }, [expired, submitted, reviewId, headers, buildPayload]);

    useEffect(() => {
        if (assignment.dueAt) {
            const timer = setInterval(() => {
                const { text, expired: exp } = formatTimeLeft(assignment.dueAt);
                setTimeLeft(text);
                if (exp) {
                    setExpired(true);
                    clearInterval(timer);
                }
            }, 1000);
            const { text, expired: exp } = formatTimeLeft(assignment.dueAt);
            setTimeLeft(text);
            setExpired(exp);
            return () => clearInterval(timer);
        }
    }, [assignment.dueAt]);

    useEffect(() => {
        if (expired || submitted) return;
        const interval = setInterval(() => {
            if (Object.keys(criterionValues).length > 0) {
                saveDraft();
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [expired, submitted, criterionValues, saveDraft]);

    useEffect(() => {
        const init = async () => {
            try {
                const startRes = await fetch(`${API_BASE}/reviews/${reviewId}/start`, {
                    method: 'POST',
                    headers: headers(),
                });
                if (!startRes.ok) {
                    const errData = await startRes.json().catch(() => ({}));
                    throw new Error(errData.message || 'Не удалось начать проверку');
                }
                const reviewData = await startRes.json();
                if (reviewData.submission) {
                    setSubmission(reviewData.submission);
                }
            } catch (err) {
                setError((err as Error).message);
                return;
            }

            try {
                const criteriaRes = await fetch(`${API_BASE}/tasks/${assignment.taskId}/criteria`, {
                    headers: headers(),
                });
                if (criteriaRes.ok) {
                    const criteriaData: Criterion[] = await criteriaRes.json();
                    setCriteria(Array.isArray(criteriaData) ? criteriaData : []);
                }
            } catch {
            }

            if (assignment.latestReview) {
                const draft = assignment.latestReview;
                if (draft.overallScore !== undefined) {
                    setOverallScore(draft.overallScore);
                }
                if (draft.overallComment) {
                    setOverallComment(draft.overallComment);
                }
                if (draft.criterionResults) {
                    const vals: Record<string, number> = {};
                    const comms: Record<string, string> = {};
                    draft.criterionResults.forEach((r) => {
                        vals[r.criterionId] = r.value;
                        if (r.comment) comms[r.criterionId] = r.comment;
                    });
                    setCriterionValues(vals);
                    setCriterionComments(comms);
                }
            }
        };
        init();
    }, [reviewId, assignment.taskId, assignment.latestReview, headers]);

    useEffect(() => {
        if (criteria.length === 0) return;
        const hasWeights = criteria.some((c) => c.weight != null);
        const hasMaxPoints = criteria.some((c) => c.maxPoints != null);
        gradingModeRef.current = hasWeights && !hasMaxPoints ? 'five_point' : 'cumulative';

        if (gradingModeRef.current === 'cumulative') {
            const total = Object.keys(criterionValues).reduce((sum, cid) => {
                const criterion = criteria.find((c) => c.id === cid);
                if (criterion && !criterion.isBonus) {
                    return sum + (criterionValues[cid] || 0);
                }
                return sum;
            }, 0);
            setOverallScore(total);
        }
    }, [criteria, criterionValues]);

    const handleAssess = (criterionId: string, value: number, comment?: string) => {
        if (expired) return;
        setCriterionValues((prev) => ({ ...prev, [criterionId]: value }));
        if (comment !== undefined) {
            setCriterionComments((prev) => ({ ...prev, [criterionId]: comment }));
        }
    };

    const handleSubmit = async () => {
        if (expired) return;

        const missingRequired = criteria.filter((c) => c.isRequired && criterionValues[c.id] === undefined);
        if (missingRequired.length > 0) {
            setError('Заполните все обязательные критерии');
            return;
        }

        if (gradingModeRef.current === 'five_point') {
            if (overallScore === undefined || overallScore < 1 || overallScore > 5) {
                setError('Укажите итоговую оценку (1–5)');
                return;
            }
        }

        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/reviews/${reviewId}/submit`, {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify(buildPayload()),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Ошибка при отправке оценки');
            }
            setSubmitted(true);
            setTimeout(() => {
                onSubmitted();
                onClose();
            }, 2000);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    const title = assignment.taskTitle || 'Проверка работы';
    const answers = submission?.answers || submission?.answerItems || [];

    const renderAnswers = () => {
        if (submission?.answers && typeof submission.answers === 'object' && !Array.isArray(submission.answers)) {
            return Object.entries(submission.answers as Record<string, any>).map(([key, value]) => (
                <div key={key} className='bg-slate-50 p-4 rounded-xl border border-slate-100'>
                    <p className='text-xs font-semibold text-slate-400 uppercase mb-1'>Вопрос</p>
                    <p className='text-sm text-slate-700 whitespace-pre-wrap'>
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                    </p>
                </div>
            ));
        }
        if (Array.isArray(answers)) {
            return answers.map((item: any, idx: number) => (
                <div key={item.id || idx} className='bg-slate-50 p-4 rounded-xl border border-slate-100'>
                    <p className='text-xs font-semibold text-slate-400 uppercase mb-1'>
                        Вопрос {idx + 1}
                    </p>
                    <p className='text-sm text-slate-700 whitespace-pre-wrap'>
                        {item.text || item.answer || JSON.stringify(item)}
                    </p>
                </div>
            ));
        }
        return (
            <div className='text-sm text-slate-400 text-center py-8'>
                Нет данных для отображения
            </div>
        );
    };

    if (error && !submitted) {
        return (
            <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
                <div className='absolute inset-0' onClick={onClose} />
                <div className='bg-white w-full max-w-md rounded-3xl shadow-2xl z-10 p-8 text-center'>
                    <AlertTriangle size={48} className='mx-auto text-red-400 mb-4' />
                    <p className='text-lg font-bold text-slate-800 mb-2'>Ошибка</p>
                    <p className='text-slate-600 mb-6'>{error}</p>
                    <button
                        onClick={onClose}
                        className='px-6 py-2.5 rounded-xl font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all'
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
            <div className='absolute inset-0' onClick={onClose} />
            <div className='bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden'>
                <div className='px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 shrink-0'>
                    <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-blue-500 to-blue-600'>
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className='text-xl font-bold text-slate-800'>Проверка работы</h3>
                            <p className='text-sm text-slate-500'>{title}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        <button
                            onClick={onClose}
                            className='p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors'
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {!expired && timeLeft && (
                    <div className='px-8 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2 shrink-0'>
                        <Clock size={16} className='text-blue-600' />
                        <span className='text-sm font-semibold text-blue-700'>{timeLeft}</span>
                    </div>
                )}

                {expired && (
                    <div className='px-8 py-2 bg-red-50 border-b border-red-100 flex items-center gap-2 shrink-0'>
                        <AlertTriangle size={16} className='text-red-600' />
                        <span className='text-sm font-semibold text-red-700'>Время истекло</span>
                    </div>
                )}

                {submitted && (
                    <div className='px-8 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 shrink-0'>
                        <CheckCircle size={16} className='text-emerald-600' />
                        <span className='text-sm font-semibold text-emerald-700'>Оценка отправлена!</span>
                    </div>
                )}

                {showSaved && (
                    <div className='absolute top-4 right-4 z-20 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg text-sm font-semibold'>
                        Сохранено
                    </div>
                )}

                <div className='flex-1 overflow-y-auto p-8'>
                    <div className='grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6'>
                        <div className='space-y-4'>
                            <h4 className='font-bold text-slate-700 flex items-center gap-2'>
                                <FileText size={16} className='text-blue-500' /> Решение студента
                            </h4>
                            {renderAnswers()}
                        </div>

                        <div className='space-y-4'>
                            <h4 className='font-bold text-slate-700 flex items-center gap-2'>
                                <CheckCircle size={16} className='text-blue-500' /> Критерии оценки
                            </h4>

                            {criteria.length === 0 && (
                                <p className='text-sm text-slate-400 text-center py-8'>
                                    Критерии не заданы
                                </p>
                            )}

                            <div className='space-y-3'>
                                {criteria.map((criterion) => (
                                    <CriterionAssessCard
                                        key={criterion.id}
                                        criterion={criterion}
                                        instructorValue={criterionValues[criterion.id]}
                                        onAssess={(value, comment) =>
                                            handleAssess(criterion.id, value, comment)
                                        }
                                    />
                                ))}
                            </div>

                            <div className='bg-white rounded-2xl border border-slate-200 p-5 space-y-4'>
                                {gradingModeRef.current === 'five_point' ? (
                                    <div>
                                        <label className='text-sm font-semibold text-slate-600 mb-2 block'>
                                            Итоговая оценка (1–5)
                                        </label>
                                        <input
                                            type='number'
                                            min={1}
                                            max={5}
                                            value={overallScore ?? ''}
                                            onChange={(e) =>
                                                setOverallScore(
                                                    e.target.value === ''
                                                        ? undefined
                                                        : Number(e.target.value),
                                                )
                                            }
                                            disabled={expired}
                                            className='w-full p-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors font-medium disabled:opacity-50'
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className='text-sm font-semibold text-slate-600 mb-2 block'>
                                            Итоговый балл (автоматически)
                                        </label>
                                        <div className='p-3 rounded-xl font-bold text-xl text-center bg-slate-50 border-2 border-slate-200 text-slate-700'>
                                            {overallScore ?? 0}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className='text-sm font-semibold text-slate-600 mb-2 block'>
                                        Комментарий
                                    </label>
                                    <textarea
                                        value={overallComment}
                                        onChange={(e) => setOverallComment(e.target.value)}
                                        rows={3}
                                        placeholder='Общий комментарий к проверке...'
                                        disabled={expired}
                                        className='w-full p-4 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors resize-none disabled:opacity-50'
                                    />
                                </div>

                                {error && (
                                    <div className='flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl'>
                                        <AlertTriangle size={16} />
                                        {error}
                                    </div>
                                )}

                                <div className='flex gap-2 pt-1'>
                                    <button
                                        onClick={saveDraft}
                                        disabled={expired || saving || submitted}
                                        className='flex-1 px-4 py-2.5 rounded-xl font-semibold text-slate-600 border-2 border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm'
                                    >
                                        <Save size={16} />
                                        {saving ? 'Сохранение...' : 'Сохранить черновик'}
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={expired || submitting || submitted}
                                        className='flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 text-sm'
                                    >
                                        {submitting ? (
                                            <>
                                                <svg
                                                    className='animate-spin h-4 w-4'
                                                    viewBox='0 0 24 24'
                                                >
                                                    <circle
                                                        cx='12'
                                                        cy='12'
                                                        r='10'
                                                        stroke='currentColor'
                                                        strokeWidth='4'
                                                        fill='none'
                                                        className='opacity-25'
                                                    />
                                                    <path
                                                        fill='currentColor'
                                                        d='M4 12a8 8 0 018-8v8z'
                                                        className='opacity-75'
                                                    />
                                                </svg>
                                                Отправка...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={16} /> Отправить оценку
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
