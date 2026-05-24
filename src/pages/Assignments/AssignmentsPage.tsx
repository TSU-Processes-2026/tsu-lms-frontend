import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import {
    Assignment,
    AssignmentFilter,
    Submission,
    Role,
} from '../../types/assignments/assignments';
import ReactMarkdown from 'react-markdown';
import { Team } from '@/types/command/Team';

interface Props {
    assignments: Assignment[];
    submissions: Submission[];
    currentUserId: string;
    subjectRoles: Record<string, Role>;
    teamsBySubject: Record<string, Team[]>;
    onOpenAssignment: (a: Assignment) => void;
    onOpenSolution: (s: Submission) => void;
    onOpenSolutionsList: (a: Assignment) => void;
    onOpenTeamDecision: (a: Assignment) => void;
}

export const AssignmentsPage: React.FC<Props> = ({
    assignments,
    submissions,
    currentUserId,
    subjectRoles,
    teamsBySubject,
    onOpenAssignment,
    onOpenSolution,
    onOpenSolutionsList,
    onOpenTeamDecision,
}) => {
    const [_filter] = useState<AssignmentFilter>('all');

    const filtered = assignments.filter((a) => {
        const sols = submissions.filter((s) => s.assignmentId === a.id);
        const role = subjectRoles[a.subjectId] ?? 'student';
        if (role === 'teacher') return true;
        const mySol = sols.find((s) => s.authorId === currentUserId);
        return !!mySol || sols.length === 0;
    });

    return (
        <div className='max-w-6xl mx-auto space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {filtered.map((a) => {
                    const role = subjectRoles[a.subjectId] ?? 'student';
                    const isTeacher = role === 'teacher';
                    const currentUserTeam =
                        teamsBySubject[a.subjectId]?.find((team) =>
                            team.members.some((member) => member.userId === currentUserId),
                        ) ?? null;
                    const mySub = submissions.find(
                        (s) => s.assignmentId === a.id && s.authorId === currentUserId,
                    );
                    const anySubs = submissions.filter((s) => s.assignmentId === a.id);
                    const pending = anySubs.filter((s) => s.status === 'RequiresReview');
                    const graded = anySubs.filter((s) => s.status === 'Graded');

                    const lines = a.content.split('\n');
                    const title = lines[0] || 'Без названия';
                    const description = lines.slice(1).join('\n') || 'Нет описания';

                    return (
                        <div
                            key={a.id}
                            className='bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col'
                        >
                            <div className='flex items-start gap-4 mb-4'>
                                <div
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 ${
                                        isTeacher ? 'bg-indigo-600' : 'bg-blue-600'
                                    }`}
                                >
                                    <HelpCircle size={22} />
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <h4 className='font-bold text-slate-800 text-lg truncate'>
                                        {title}
                                    </h4>
                                </div>
                            </div>

                            <div className='text-sm text-slate-500 line-clamp-4 mb-4 flex-1'>
                                <ReactMarkdown>{description}</ReactMarkdown>
                            </div>

                            <div className='flex flex-wrap gap-2 mb-6'>
                                {isTeacher ? (
                                    <>
                                        {pending.length > 0 && (
                                            <span className='px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold'>
                                                ОЖИДАЮТ: {pending.length}
                                            </span>
                                        )}
                                        {graded.length > 0 && (
                                            <span className='px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold'>
                                                ПРОВЕРЕНО: {graded.length}
                                            </span>
                                        )}
                                        {anySubs.length === 0 && (
                                            <span className='px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold'>
                                                НЕТ РЕШЕНИЙ
                                            </span>
                                        )}
                                        <button
                                            className='px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-xs font-bold mt-2'
                                            onClick={() => onOpenSolutionsList(a)}
                                        >
                                            Все сдачи
                                        </button>
                                        <button
                                            className='px-4 py-2 bg-violet-100 text-violet-700 rounded-xl text-xs font-bold mt-2'
                                            onClick={() => onOpenAssignment(a)}
                                        >
                                            Критерии
                                        </button>
                                        {anySubs.map((sub) => (
                                            <button
                                                key={sub.id}
                                                className='px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold mt-2'
                                                onClick={() => onOpenSolution(sub)}
                                            >
                                                Работа: {sub.authorName || sub.authorId}
                                            </button>
                                        ))}
                                    </>
                                ) : (
                                    <div className='text-[10px] font-bold uppercase tracking-widest'>
                                        {!mySub && (
                                            <span className='text-amber-600 bg-amber-50 px-3 py-1 rounded-full'>
                                                Не начато
                                            </span>
                                        )}
                                        {mySub?.status === 'Draft' && (
                                            <span className='text-blue-600 bg-blue-50 px-3 py-1 rounded-full'>
                                                Черновик
                                            </span>
                                        )}
                                        {mySub?.status === 'RequiresReview' && (
                                            <span className='text-purple-600 bg-purple-50 px-3 py-1 rounded-full'>
                                                На проверке
                                            </span>
                                        )}
                                        {mySub?.status === 'Graded' && (
                                            <span className='text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full'>
                                                Оценено
                                            </span>
                                        )}
                                        {mySub && (
                                            <button
                                                className='px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold mt-2'
                                                onClick={() => onOpenSolution(mySub)}
                                            >
                                                Посмотреть свою работу
                                            </button>
                                        )}
                                        {currentUserTeam && (
                                            <button
                                                className='px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-xs font-bold mt-2'
                                                onClick={() => onOpenTeamDecision(a)}
                                            >
                                                Выбрать решение команды
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    if (isTeacher) onOpenSolutionsList(a);
                                    else if (mySub) onOpenSolution(mySub);
                                    else onOpenAssignment(a);
                                }}
                                className={`w-full py-3 rounded-2xl font-bold text-sm transition-all ${
                                    isTeacher
                                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100'
                                }`}
                            >
                                {isTeacher
                                    ? anySubs.length > 0
                                        ? `Проверить (${anySubs.length})`
                                        : 'Нет решений'
                                    : mySub?.status === 'Graded'
                                      ? 'Посмотреть оценку'
                                      : mySub?.status === 'RequiresReview'
                                        ? 'Ваше решение'
                                        : 'Начать выполнение'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
