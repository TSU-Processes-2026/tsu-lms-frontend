import React from 'react';
import { Submission } from '@/types/assignments/assignments';
import { Criterion, CriterionResult } from '@/types/assignments/criteria';

interface Props {
  submission: Submission;
  criteria: Criterion[];
  results: CriterionResult[];
  onUpsertInstructor: (criterionId: string, value: number) => void;
  isTeacher: boolean;
}

export const SubmissionAssessmentPanel: React.FC<Props> = ({ submission, criteria, results, onUpsertInstructor, isTeacher }) => {
  const by = (criterionId: string, type: 'SELF' | 'INSTRUCTOR') => results.find((r) => r.criterionId === criterionId && r.assessmentType === type);
  return <div className='bg-white border rounded-2xl p-5 space-y-3'>
    <h3 className='font-bold text-lg'>Детали решения: {submission.authorName || submission.authorId}</h3>
    {criteria.map((criterion) => {
      const self = by(criterion.id, 'SELF');
      const instructor = by(criterion.id, 'INSTRUCTOR');
      return <div key={criterion.id} className='border rounded-xl p-3'>
        <div className='font-semibold text-sm'>{criterion.description}</div>
        <div className='text-xs text-slate-500 mt-1'>SELF: {String(self?.value ?? '—')} • INSTRUCTOR: {String(instructor?.value ?? '—')}</div>
        {isTeacher && <div className='mt-2 flex gap-2'>
          {criterion.format === 'checklist' ? (
            <>
              <button onClick={() => onUpsertInstructor(criterion.id, 1)} className='px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs'>Да</button>
              <button onClick={() => onUpsertInstructor(criterion.id, 0)} className='px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs'>Нет</button>
            </>
          ) : (
            <>
              <button onClick={() => onUpsertInstructor(criterion.id, 0)} className='px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs'>0%</button>
              <button onClick={() => onUpsertInstructor(criterion.id, 50)} className='px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs'>50%</button>
              <button onClick={() => onUpsertInstructor(criterion.id, 100)} className='px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs'>100%</button>
            </>
          )}
        </div>}
      </div>;
    })}
  </div>;
};
