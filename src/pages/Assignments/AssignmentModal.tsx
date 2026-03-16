import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { QuizEngine } from './QuizEngine';
import { Assignment, Submission, Question } from '../../types/assignments/assignments';

interface Props {
    assignment: Assignment;
    submission?: Submission;
    isSubmitting?: boolean;
    onClose: () => void;
    onSubmit: (questions: Question[], answers: Record<string, any>) => Promise<boolean>;
    onSaveDraft: (questions: Question[], answers: Record<string, any>) => Promise<boolean>;
    onWithdraw: (submissionId: string) => Promise<boolean>;
}

export const AssignmentModal: React.FC<Props> = ({
    assignment,
    submission,
    isSubmitting = false,
    onClose,
    onSubmit,
    onSaveDraft,
    onWithdraw,
}) => {
    const [answers, setAnswers] = useState<Record<string, any>>(submission?.answers || {});

    const isReadOnly = submission ? submission.status !== 'Draft' : false;
    const canWithdraw = submission?.status === 'RequiresReview';

    useEffect(() => {
        setAnswers(submission?.answers || {});
    }, [submission]);

    const handleSubmit = async () => {
        const success = await onSubmit(assignment.questions, answers);
        if (success) onClose();
    };

    const handleSaveDraft = async () => {
        const success = await onSaveDraft(assignment.questions, answers);
        if (success) onClose();
    };

    const handleWithdraw = async () => {
        if (!submission) return;
        const success = await onWithdraw(submission.id);
        if (success) onClose();
    };

    return (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl'>
                <div className='flex items-center justify-between p-6 border-b border-slate-100'>
                    <h2 className='text-xl font-bold text-slate-800'>
                        {assignment.content.split('\n')[0] || 'Задание'}
                    </h2>
                    <button
                        onClick={onClose}
                        className='p-2 hover:bg-slate-100 rounded-xl transition-colors'
                        aria-label='Закрыть'
                    >
                        <X size={20} />
                    </button>
                </div>

                {submission?.grade && (
                    <div className='px-6 pt-6'>
                        <div className='bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4'>
                            <div className='flex items-center justify-between'>
                                <span className='font-bold'>Оценка</span>
                                <span className='text-lg font-black'>{submission.grade.score}</span>
                            </div>
                            {submission.grade.verdictText && (
                                <p className='text-sm mt-2 text-emerald-700'>
                                    {submission.grade.verdictText}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {canWithdraw && (
                    <div className='px-6 pt-6'>
                        <button
                            onClick={handleWithdraw}
                            className='px-4 py-2 text-sm font-semibold text-amber-700 bg-amber-100 rounded-xl'
                        >
                            Отменить отправку
                        </button>
                    </div>
                )}

                <div className='flex-1 overflow-y-auto p-6'>
                    <QuizEngine
                        questions={assignment.questions}
                        initialAnswers={answers}
                        onAnswerChange={setAnswers}
                        onSaveDraft={handleSaveDraft}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        readOnly={isReadOnly}
                    />
                </div>
            </div>
        </div>
    );
};
