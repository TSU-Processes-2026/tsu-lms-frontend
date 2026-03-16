import React, { useEffect, useState } from 'react';
import { UserIcon, X, Trash2, PenLine, MessageSquare, Send, Save } from 'lucide-react';
import { Assignment, Submission, Comment, Grade } from '../../types/assignments/assignments';

interface Props {
    submission: Submission;
    assignment: Assignment;
    onClose: () => void;
    onGradeCreate: (submissionId: string, score: number, verdictText: string) => Promise<Grade | null>;
    onGradeUpdate: (submissionId: string, score: number, verdictText: string) => Promise<Grade | null>;
    onGradeDelete: (submissionId: string) => Promise<boolean>;
    onLoadComments: (submissionId: string) => Promise<Comment[]>;
    onAddComment: (submissionId: string, text: string) => Promise<Comment | null>;
}

export const TeacherReviewModal: React.FC<Props> = ({
    submission,
    assignment,
    onClose,
    onGradeCreate,
    onGradeUpdate,
    onGradeDelete,
    onLoadComments,
    onAddComment,
}) => {
    const [score, setScore] = useState(submission.grade?.score?.toString() || '');
    const [verdictText, setVerdictText] = useState(submission.grade?.verdictText || '');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [comments, setComments] = useState<Comment[]>(submission.comments || []);

    useEffect(() => {
        onLoadComments(submission.id)
            .then((data) => setComments(data))
            .catch(() => setComments([]));
    }, [onLoadComments, submission.id]);

    useEffect(() => {
        setScore(submission.grade?.score?.toString() || '');
        setVerdictText(submission.grade?.verdictText || '');
    }, [submission]);

    const handleGrade = async () => {
        if (!score) return;
        setSubmitting(true);
        try {
            const scoreValue = Number(score);
            if (submission.grade) {
                await onGradeUpdate(submission.id, scoreValue, verdictText);
            } else {
                await onGradeCreate(submission.id, scoreValue, verdictText);
            }
            onClose();
        } catch (err) {
            alert('Ошибка: ' + (err as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteGrade = async () => {
        setSubmitting(true);
        try {
            await onGradeDelete(submission.id);
            onClose();
        } catch (err) {
            alert('Ошибка: ' + (err as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleComment = async () => {
        if (!comment.trim()) return;
        try {
            const created = await onAddComment(submission.id, comment.trim());
            if (created) {
                setComments((prev) => [...prev, created]);
                setComment('');
            }
        } catch (err) {
            alert('Ошибка: ' + (err as Error).message);
        }
    };

    const title = assignment.content.split('\n')[0] || 'Задание';

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-slate-900/60 backdrop-blur-sm' onClick={onClose} />
            <div className='bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl z-10 flex flex-col overflow-hidden'>
                <div className='px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 shrink-0'>
                    <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-blue-500 to-blue-600'>
                            <UserIcon size={24} />
                        </div>
                        <div>
                            <h3 className='text-xl font-bold text-slate-800'>
                                {submission.authorName || 'Студент'}
                            </h3>
                            <p className='text-sm text-slate-500'>
                                {title} • Сдано:{' '}
                                {new Date(submission.createdAt).toLocaleDateString()}
                                {submission.grade && submission.grade.score !== undefined && ' • Оценено'}
                            </p>
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        {submission.grade && (
                            <button
                                onClick={handleDeleteGrade}
                                className='px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center gap-1'
                            >
                                <Trash2 size={16} /> Удалить оценку
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className='p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors'
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className='flex-1 overflow-y-auto p-8 space-y-6'>
                    <div className='space-y-4'>
                        <h4 className='font-bold text-slate-700 flex items-center gap-2'>
                            <PenLine size={16} className='text-blue-500' /> Ответы студента
                        </h4>
                        {assignment.questions.map((q) => {
                            const studentAnswer = submission.answers?.[q.id];
                            return (
                                <div
                                    key={q.id}
                                    className='bg-slate-50 p-6 rounded-2xl border border-slate-100'
                                >
                                    <h4 className='font-bold text-slate-800 mb-4'>
                                        {q.questionData}
                                    </h4>

                                    {q.questionType === 'SingleChoice' && (
                                        <p className='text-slate-600'>
                                            <span className='font-semibold'>Ответ:</span>{' '}
                                            {q.options?.find((opt) => opt.id === studentAnswer)?.text ||
                                                studentAnswer ||
                                                '—'}
                                        </p>
                                    )}

                                    {q.questionType === 'MultipleChoice' && (
                                        <p className='text-slate-600'>
                                            <span className='font-semibold'>Ответ:</span>{' '}
                                            {(Array.isArray(studentAnswer) ? studentAnswer : [])
                                                .map(
                                                    (id) =>
                                                        q.options?.find((opt) => opt.id === id)?.text,
                                                )
                                                .filter(Boolean)
                                                .join(', ') || '—'}
                                        </p>
                                    )}

                                    {q.questionType === 'Text' && (
                                        <div className='bg-white p-4 rounded-xl border border-slate-200'>
                                            <p className='text-slate-700 whitespace-pre-wrap'>
                                                {studentAnswer || '—'}
                                            </p>
                                        </div>
                                    )}

                                    {q.questionType === 'File' && (
                                        <p className='text-slate-600'>
                                            <span className='font-semibold'>Файл:</span>{' '}
                                            {studentAnswer?.fileName || 'Загружен файл'}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className='bg-slate-50 rounded-2xl border border-slate-200 p-6'>
                        <h4 className='font-bold text-slate-800 mb-4 flex items-center gap-2'>
                            <MessageSquare size={16} className='text-slate-500' /> Комментарии к
                            решению
                        </h4>
                        <div className='space-y-3 mb-4'>
                            {comments.length === 0 && (
                                <p className='text-sm text-slate-400 text-center py-4'>
                                    Пока нет комментариев
                                </p>
                            )}
                            {comments.map((c: Comment) => (
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
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                                placeholder='Добавить комментарий к решению...'
                                className='flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all'
                            />
                            <button
                                onClick={handleComment}
                                className='p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all'
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>

                    <div className='p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-100'>
                        <h4 className='font-bold text-slate-800 mb-4'>Оценка</h4>
                        <div className='grid grid-cols-2 gap-4 mb-4'>
                            <div>
                                <label className='text-sm font-semibold text-slate-600 mb-2 block'>
                                    Баллы
                                </label>
                                <input
                                    type='number'
                                    value={score}
                                    onChange={(e) => setScore(e.target.value)}
                                    placeholder='0–100'
                                    max={100}
                                    min={0}
                                    className='w-full p-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors font-medium'
                                />
                            </div>
                            <div>
                                <label className='text-sm font-semibold text-slate-600 mb-2 block'>
                                    Процент
                                </label>
                                <div
                                    className={`p-3 rounded-xl font-bold text-xl text-center ${
                                        score
                                            ? 'bg-white border-2 border-blue-200 text-blue-700'
                                            : 'bg-slate-100 text-slate-400'
                                    }`}
                                >
                                    {score ? Math.round((+score / 100) * 100) : 0}%
                                </div>
                            </div>
                        </div>
                        <label className='text-sm font-semibold text-slate-600 mb-2 block'>
                            Вердикт / комментарий
                        </label>
                        <textarea
                            value={verdictText}
                            onChange={(e) => setVerdictText(e.target.value)}
                            rows={4}
                            placeholder='Напишите обратную связь для студента...'
                            className='w-full p-4 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors resize-none'
                        />
                    </div>
                </div>

                <div className='px-8 py-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/30 shrink-0'>
                    <button
                        onClick={onClose}
                        className='px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all'
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleGrade}
                        disabled={submitting}
                        className='bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0'
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
                            <>
                                <Save size={18} /> {submission.grade ? 'Обновить оценку' : 'Сохранить оценку'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
