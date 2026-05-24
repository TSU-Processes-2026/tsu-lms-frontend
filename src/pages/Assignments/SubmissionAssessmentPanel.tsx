import React from 'react';
import { Submission } from '@/types/assignments/assignments';
import { Criterion, CriterionResult } from '@/types/assignments/criteria';
import { CriterionAssessCard } from './CriterionAssessCard';

interface Props {
  submission: Submission;
  criteria: Criterion[];
  results: CriterionResult[];
  onUpsertInstructor: (criterionId: string, value: number, comment?: string) => void;
  isTeacher: boolean;
}

export const SubmissionAssessmentPanel: React.FC<Props> = ({ submission, criteria, results, onUpsertInstructor, isTeacher }) => {
  const by = (criterionId: string, type: 'SELF' | 'INSTRUCTOR') => results.find((r) => r.criterionId === criterionId && r.assessmentType === type);
  if (!isTeacher) {
    return (
      <div className='bg-white border rounded-2xl p-5 space-y-3 shadow-sm'>
        <h3 className='font-bold text-lg text-slate-800'>Результаты оценивания</h3>
        {criteria.length === 0 && <p className='text-sm text-slate-400 text-center py-4'>Критерии не заданы</p>}
        {criteria.map((criterion) => {
          const self = by(criterion.id, 'SELF');
          const instructor = by(criterion.id, 'INSTRUCTOR');
          return (
            <div key={criterion.id} className={`border rounded-xl p-4 ${criterion.isBonus ? 'border-emerald-200 bg-emerald-50/30' : criterion.isPenalty ? 'border-red-200 bg-red-50/30' : 'border-slate-200 bg-white'}`}>
              <div className='font-semibold text-sm text-slate-800'>{criterion.description}</div>
              <div className='flex flex-wrap items-center gap-3 mt-2 text-xs'>
                {self !== undefined && <span className='text-slate-500'>Самооценка: <strong>{criterion.format === 'checklist' ? (self.value ? 'Да' : 'Нет') : `${self.value}%`}</strong></span>}
                {instructor !== undefined && <span className='text-blue-600'>Оценка преподавателя: <strong>{criterion.format === 'checklist' ? (instructor.value ? 'Да' : 'Нет') : `${instructor.value}%`}</strong></span>}
                {instructor?.comment && <span className='text-slate-500'>Комментарий: {instructor.comment}</span>}
                {!instructor && <span className='text-amber-600'>Ожидает проверки</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className='bg-white border rounded-2xl p-5 space-y-3 shadow-sm'>
      <h3 className='font-bold text-lg text-slate-800'>Оценивание по критериям: {submission.authorName || submission.authorId}</h3>
      {criteria.length === 0 && <p className='text-sm text-slate-400 text-center py-4'>Критерии не заданы для этого задания</p>}
      {criteria.map((criterion) => {
        const self = by(criterion.id, 'SELF');
        const instructor = by(criterion.id, 'INSTRUCTOR');
        return (
          <CriterionAssessCard
            key={criterion.id}
            criterion={criterion}
            selfValue={self?.value}
            instructorValue={instructor?.value}
            instructorComment={instructor?.comment}
            onAssess={(value, comment) => onUpsertInstructor(criterion.id, value, comment)}
          />
        );
      })}
    </div>
  );
};
