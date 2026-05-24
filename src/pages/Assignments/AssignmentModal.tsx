import React, { useEffect, useState } from 'react';
import { X, ClipboardCheck } from 'lucide-react';
import { QuizEngine } from './QuizEngine';
import { Assignment, Submission, Question } from '../../types/assignments/assignments';
import { Criterion, CriterionResult } from '@/types/assignments/criteria';

export interface SelfAssessmentDraft {
    criterionId: string;
    value: number;
    comment?: string;
}

interface Props {
    assignment: Assignment;
    submission?: Submission;
    isSubmitting?: boolean;
    onClose: () => void;
    criteria?: Criterion[];
    criteriaHidden?: boolean;
    onSubmit: (questions: Question[], answers: Record<string, any>, selfAssessments: SelfAssessmentDraft[]) => Promise<boolean>;
    onSaveDraft: (questions: Question[], answers: Record<string, any>, selfAssessments: SelfAssessmentDraft[]) => Promise<boolean>;
    onWithdraw: (submissionId: string) => Promise<boolean>;
    criterionResults?: CriterionResult[];
}

export const AssignmentModal: React.FC<Props> = ({
    assignment,
    submission,
    isSubmitting = false,
    onClose,
    criteria = [],
    criteriaHidden = false,
    onSubmit,
    onSaveDraft,
    onWithdraw,
    criterionResults = [],
}) => {
    const [answers, setAnswers] = useState<Record<string, any>>(submission?.answers || {});
    const [selfAssessments, setSelfAssessments] = useState<Record<string, number>>({});

    const isReadOnly = submission ? submission.status !== 'Draft' : false;
    const canWithdraw = submission?.status === 'RequiresReview';

    useEffect(() => {
        setAnswers(submission?.answers || {});
    }, [submission]);

    const handleSubmit = async () => {
        const payload = buildSelfAssessments();
        if (!validateSelfAssessments(payload)) return;
        const success = await onSubmit(assignment.questions, answers, payload);
        if (success) onClose();
    };

    const handleSaveDraft = async () => {
        const payload = buildSelfAssessments();
        const success = await onSaveDraft(assignment.questions, answers, payload);
        if (success) onClose();
    };

    const handleWithdraw = async () => {
        if (!submission) return;
        const success = await onWithdraw(submission.id);
        if (success) onClose();
    };

    const updateSelfAssessment = (criterionId: string, value: number) => {
        setSelfAssessments((prev) => ({ ...prev, [criterionId]: value }));
    };

    const buildSelfAssessments = (): SelfAssessmentDraft[] =>
        criteria.map((criterion) => ({
            criterionId: criterion.id,
            value: selfAssessments[criterion.id] ?? 0,
        }));

    const validateSelfAssessments = (payload: SelfAssessmentDraft[]) => {
        if (criteriaHidden) {
            alert('Критерии ещё скрыты. Отправка будет доступна после открытия самооценки.');
            return false;
        }

        if (criteria.length === 0) {
            return true;
        }

        const valid = payload.every((item) => {
            const criterion = criteria.find((c) => c.id === item.criterionId);
            if (!criterion) return false;
            if (criterion.format === 'checklist') return item.value === 0 || item.value === 1;
            if (criterion.format === 'percentage') return item.value === 0 || item.value === 50 || item.value === 100;
            if (criterion.format === 'numeric') return item.value >= 0;
            return false;
        });

        if (!valid) {
            alert('Заполните самооценку по каждому критерию корректно.');
            return false;
        }

        return true;
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
                    {criteria.length > 0 && (
                        <div className='mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                            <h3 className='font-bold text-slate-800 mb-3 flex items-center gap-2'>
                                <ClipboardCheck size={16} className='text-blue-500' /> Критерии
                            </h3>
                            {criteriaHidden ? (
                                <p className='text-sm text-amber-700'>Критерии станут доступны позже.</p>
                            ) : (
                                <div className='space-y-3'>
                                    {criteria.map((criterion) => {
                                        const self = criterionResults.find((r) => r.criterionId === criterion.id && r.assessmentType === 'SELF');
                                        const instructor = criterionResults.find((r) => r.criterionId === criterion.id && r.assessmentType === 'INSTRUCTOR');
                                        const isGraded = submission?.status === 'Graded';
                                        const showInstructor = isGraded && instructor;
                                        return (
                                            <div key={criterion.id} className={`bg-white border rounded-xl p-3 ${showInstructor ? 'border-emerald-200' : 'border-slate-200'}`}>
                                                <div className='text-sm font-semibold text-slate-700'>{criterion.description}</div>
                                                {criterion.isBonus && <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 ml-2'>Бонус</span>}
                                                {criterion.isPenalty && <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 ml-2'>Штраф</span>}
                                                
                                                {!isGraded && !isReadOnly && !canWithdraw && (
                                                    <div className='mt-2 flex flex-wrap gap-2'>
                                                        {criterion.format === 'checklist' ? (
                                                            <>
                                                                <button type='button' onClick={() => updateSelfAssessment(criterion.id, 1)} className={`px-3 py-1 rounded-lg text-xs ${selfAssessments[criterion.id] === 1 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>Да</button>
                                                                <button type='button' onClick={() => updateSelfAssessment(criterion.id, 0)} className={`px-3 py-1 rounded-lg text-xs ${selfAssessments[criterion.id] === 0 ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'}`}>Нет</button>
                                                            </>
                                                        ) : criterion.format === 'percentage' ? (
                                                            [0, 50, 100].map((value) => (
                                                                <button key={value} type='button' onClick={() => updateSelfAssessment(criterion.id, value)} className={`px-3 py-1 rounded-lg text-xs ${selfAssessments[criterion.id] === value ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}>{value}%</button>
                                                            ))
                                                        ) : (
                                                            <input
                                                                type='number'
                                                                min={0}
                                                                max={criterion.maxPoints ?? 100}
                                                                step='any'
                                                                value={selfAssessments[criterion.id] ?? 0}
                                                                onChange={(e) => updateSelfAssessment(criterion.id, Number(e.target.value))}
                                                                className='w-24 px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500'
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {showInstructor && (
                                                    <div className='mt-2 text-xs'>
                                                        <span className='text-emerald-600 font-semibold'>Оценка: {criterion.format === 'checklist' ? (instructor.value ? 'Да' : 'Нет') : criterion.format === 'percentage' ? `${instructor.value}%` : instructor.value}</span>
                                                        {instructor.comment && <span className='text-slate-500 ml-2'>Комментарий: {instructor.comment}</span>}
                                                    </div>
                                                )}
                                                
                                                {self && (isReadOnly || canWithdraw) && !showInstructor && (
                                                    <div className='mt-2 text-xs text-slate-500'>
                                                        Ваша самооценка: <strong>{criterion.format === 'checklist' ? (self.value ? 'Да' : 'Нет') : criterion.format === 'percentage' ? `${self.value}%` : self.value}</strong>
                                                        {!instructor && <span className='text-amber-600 ml-2'>Ожидает проверки</span>}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
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
