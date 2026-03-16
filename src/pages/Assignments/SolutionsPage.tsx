// src/pages/Assignments/SolutionsListPage.tsx
import React from 'react';
import { ChevronLeft, Clock, CheckCircle, HelpCircle, UserIcon, Users, Edit } from 'lucide-react';
import { Assignment, Submission } from '../../types/assignments/assignments';

interface Props {
    assignment: Assignment;
    solutions: Submission[];
    onReview: (s: Submission) => void;
    onBack: () => void;
}

export const SolutionsListPage: React.FC<Props> = ({ assignment, solutions, onReview, onBack }) => {
    const pending = solutions.filter((s) => s.status === 'RequiresReview');
    const graded = solutions.filter((s) => s.status === 'Graded');

    // Парсим title из content (первая строка)
    const title = assignment.content.split('\n')[0] || 'Задание';

    // Парсим maxScore из assignmentData (JSON строка)
    let maxScore = 100;
    try {
        const data = assignment.assignmentData ? JSON.parse(assignment.assignmentData) : {};
        maxScore = data.maxScore ?? 100;
    } catch {
        maxScore = 100;
    }

    return (
        <div className='max-w-4xl mx-auto'>
            <button
                onClick={onBack}
                className='flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium text-sm mb-6 transition-colors'
                aria-label='Назад к заданиям'
            >
                <ChevronLeft size={18} /> Назад к заданиям
            </button>

            {/* Заголовок задания + статистика */}
            <div className='bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden mb-6'>
                <div className='p-6 border-b border-slate-100 bg-slate-50/50'>
                    <div className='flex items-start gap-4'>
                        <div className='w-12 h-12 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600'>
                            <HelpCircle size={22} />
                        </div>
                        <div className='flex-1'>
                            <h2 className='text-xl font-bold text-slate-800'>{title}</h2>
                            <p className='text-sm text-slate-500 mt-1'>{maxScore} баллов • Тест</p>
                        </div>
                    </div>
                    <div className='flex gap-4 mt-4'>
                        <div className='flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm'>
                            <Clock size={14} className='text-amber-500' />
                            <span className='font-semibold text-slate-700'>
                                {pending.length} на проверке
                            </span>
                        </div>
                        <div className='flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm'>
                            <CheckCircle size={14} className='text-emerald-500' />
                            <span className='font-semibold text-slate-700'>
                                {graded.length} проверено
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ожидают проверки */}
            {pending.length > 0 && (
                <div className='mb-6'>
                    <h3 className='text-sm font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-2'>
                        <Clock size={14} /> Ожидают проверки ({pending.length})
                    </h3>
                    <div className='space-y-3'>
                        {pending.map((sol) => (
                            <div
                                key={sol.id}
                                className='bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all'
                            >
                                <div className='flex items-center gap-4'>
                                    <div className='w-11 h-11 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-md'>
                                        <UserIcon size={20} className='text-white' />
                                    </div>
                                    <div>
                                        <p className='font-bold text-slate-800'>
                                            {sol.authorName || 'Студент'}
                                        </p>
                                        <p className='text-sm text-slate-500'>
                                            Сдано:{' '}
                                            {new Date(
                                                sol.submittedAt || sol.createdAt,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                // В SolutionsListPage, кнопка "Проверить": // В
                                SolutionsListPage.tsx, кнопка "Проверить":
                                <button
                                    onClick={() => {
                                        console.log('🔘 Клик на Проверить:', {
                                            submissionId: sol.id,
                                            authorName: sol.authorName,
                                            status: sol.status,
                                        });
                                        onReview(sol);
                                    }}
                                    className='bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:-translate-y-0.5 transition-all text-sm'
                                >
                                    Проверить
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Проверено */}
            {graded.length > 0 && (
                <div>
                    <h3 className='text-sm font-bold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-2'>
                        <CheckCircle size={14} /> Проверено ({graded.length})
                    </h3>
                    <div className='space-y-3'>
                        {graded.map((sol) => (
                            <div
                                key={sol.id}
                                className='bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all'
                            >
                                <div className='flex items-center gap-4'>
                                    <div className='w-11 h-11 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-md'>
                                        <UserIcon size={20} className='text-white' />
                                    </div>
                                    <div>
                                        <p className='font-bold text-slate-800'>
                                            {sol.authorName || 'Студент'}
                                        </p>
                                        <p className='text-sm text-slate-500'>
                                            Проверено:{' '}
                                            {sol.grade?.gradedAt
                                                ? new Date(sol.grade.gradedAt).toLocaleDateString()
                                                : '—'}
                                        </p>
                                    </div>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <div className='text-right'>
                                        <p className='text-xl font-black text-emerald-700'>
                                            {sol.grade?.score ?? 0}{' '}
                                            <span className='text-sm text-slate-400'>
                                                / {maxScore}
                                            </span>
                                        </p>
                                        <p className='text-xs text-emerald-600'>
                                            {maxScore > 0
                                                ? Math.round(
                                                      ((sol.grade?.score ?? 0) / maxScore) * 100,
                                                  )
                                                : 0}
                                            %
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onReview(sol)}
                                        className='bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm flex items-center gap-1'
                                    >
                                        <Edit size={14} /> Изменить
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {solutions.length === 0 && (
                <div className='bg-white rounded-3xl border border-slate-100 shadow-sm p-16 text-center'>
                    <div className='w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <Users size={28} className='text-slate-400' />
                    </div>
                    <h4 className='text-xl font-bold text-slate-700 mb-2'>Нет ответов</h4>
                    <p className='text-slate-400'>Студенты ещё не сдавали это задание</p>
                </div>
            )}
        </div>
    );
};
