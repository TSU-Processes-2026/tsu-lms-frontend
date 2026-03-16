// src/pages/Assignments/AssignmentModal.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { QuizEngine } from './QuizEngine';
import { Assignment, Submission, Question } from '../../types/assignments/assignments';
import { transformAnswersToApi } from '@/utils/answerTransformer';

interface Props {
    assignment: Assignment;
    submission?: Submission;
    token: string;
    isSubmitting?: boolean;
    onClose: () => void;
    onSubmit: (questions: Question[], answers: Record<string, any>) => Promise<boolean>;
    onSubmissionUpdated?: () => void;
}

export const AssignmentModal: React.FC<Props> = ({
    assignment,
    submission,
    token,
    isSubmitting = false,
    onClose,
    onSubmit,
    onSubmissionUpdated,
}) => {
    const [answers, setAnswers] = useState<Record<string, any>>(submission?.answers || {});

    const handleSubmit = async () => {
        const success = await onSubmit(assignment.questions, answers);
        if (success) {
            onSubmissionUpdated?.();
            onClose();
        }
    };

    const handleSaveDraft = async () => {
        // Черновики: можно отправить с флагом или просто сохранить локально
        // Для простоты — вызываем тот же onSubmit
        await handleSubmit();
    };

    return (
        <>
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

                    {/* Content */}
                    <div className='flex-1 overflow-y-auto p-6'>
                        <QuizEngine
                            questions={assignment.questions}
                            initialAnswers={answers}
                            onAnswerChange={setAnswers}
                            onSaveDraft={handleSaveDraft}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};
