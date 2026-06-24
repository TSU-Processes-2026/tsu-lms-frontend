import React, { useState } from 'react';
import { X, Star, AlertTriangle } from 'lucide-react';
import { DEV_URL, PROD_URL, MOCK_URL } from '@/constants/config/config';
import { ACCESS_TOKEN } from '@/constants/auth/auth';

export interface ManualGradeOverrideModalProps {
    submissionId: string;
    currentScore?: number;
    currentSource?: string;
    onClose: () => void;
    onOverridden: () => void;
}

const API_BASE = DEV_URL || PROD_URL || MOCK_URL;

export const ManualGradeOverrideModal: React.FC<ManualGradeOverrideModalProps> = ({
    submissionId,
    currentScore,
    currentSource,
    onClose,
    onOverridden,
}) => {
    const [score, setScore] = useState('');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sourceLabel =
        currentSource === 'teacher'
            ? 'Преподаватель'
            : currentSource === 'mixed'
            ? 'Смешанная'
            : 'Peer';

    const sourceColor =
        currentSource === 'teacher'
            ? 'text-blue-600'
            : currentSource === 'mixed'
            ? 'text-purple-600'
            : 'text-emerald-600';

    const handleSubmit = async () => {
        const scoreValue = Number(score);
        if (!score || !Number.isFinite(scoreValue) || scoreValue < 0) {
            setError('Укажите корректный балл');
            return;
        }

        if (currentScore !== undefined && Math.abs(scoreValue - currentScore) > 20 && !comment.trim()) {
            setError('При значительном изменении оценки требуется комментарий');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem(ACCESS_TOKEN);
            const res = await fetch(`${API_BASE}/submissions/${submissionId}/final-grade`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ finalScore: scoreValue, comment: comment.trim() || undefined }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Ошибка при переопределении оценки');
            }

            onOverridden();
            onClose();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className='fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
            <div className='absolute inset-0' onClick={onClose} />
            <div className='bg-white w-full max-w-md rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden'>
                <div className='px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 shrink-0'>
                    <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-violet-500 to-violet-600'>
                            <Star size={20} />
                        </div>
                        <h3 className='text-lg font-bold text-slate-800'>
                            Переопределить итоговую оценку
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className='p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors'
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className='p-6 space-y-5'>
                    {(currentScore !== undefined || currentSource) && (
                        <div className='bg-slate-50 rounded-2xl border border-slate-200 p-4'>
                            <p className='text-sm text-slate-500 mb-1'>Текущая оценка</p>
                            <div className='flex items-center gap-3'>
                                <span className='text-2xl font-black text-slate-800'>
                                    {currentScore ?? '—'}
                                </span>
                                {currentSource && (
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sourceColor} bg-slate-100`}>
                                        {sourceLabel}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className='text-sm font-semibold text-slate-600 mb-2 block'>
                            Новая оценка
                        </label>
                        <input
                            type='number'
                            value={score}
                            onChange={(e) => {
                                setScore(e.target.value);
                                setError(null);
                            }}
                            placeholder='0–100'
                            min={0}
                            max={100}
                            className='w-full p-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-violet-500 transition-colors font-medium text-lg'
                        />
                    </div>

                    <div>
                        <label className='text-sm font-semibold text-slate-600 mb-2 block'>
                            Комментарий преподавателя
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => {
                                setComment(e.target.value);
                                setError(null);
                            }}
                            rows={3}
                            placeholder='Поясните причину переопределения оценки...'
                            className='w-full p-4 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-violet-500 transition-colors resize-none'
                        />
                    </div>

                    <div className='bg-amber-50 rounded-xl border border-amber-200 p-3 text-sm text-amber-700 flex items-start gap-2'>
                        <AlertTriangle size={16} className='shrink-0 mt-0.5' />
                        <span>Peer-оценки студентов сохранятся в истории</span>
                    </div>

                    {error && (
                        <div className='flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl'>
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    )}
                </div>

                <div className='px-6 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/30 shrink-0'>
                    <button
                        onClick={onClose}
                        className='px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all'
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className='bg-gradient-to-r from-violet-600 to-violet-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0'
                    >
                        {submitting ? (
                            <>
                                <svg className='animate-spin h-5 w-5' viewBox='0 0 24 24'>
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
                                Сохранение...
                            </>
                        ) : (
                            <>Применить</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
