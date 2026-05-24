import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Assignment, Submission } from '@/types/assignments/assignments';
import { Criterion, CriterionResult, StudentCourseGrade } from '@/types/assignments/criteria';
import { CriteriaManagerPanel } from './CriteriaManagerPanel';
import { SubmissionAssessmentPanel } from './SubmissionAssessmentPanel';
import { CourseGradesPanel } from './CourseGradesPanel';

const demoAssignment: Assignment = {
  id: 'a1',
  subjectId: 's1',
  authorId: 't1',
  postType: 'Assignment',
  content: 'Проектная работа №1\nРеализовать сервис и покрыть тестами',
  createdAt: new Date().toISOString(),
  questions: [],
};

const baseCriteria: Criterion[] = [
  { id: 'c1', taskId: 'a1', description: 'Корректность API', format: 'checklist', weight: 1, maxPoints: 5, order: 1 },
  { id: 'c2', taskId: 'a1', description: 'Покрытие тестами', format: 'percentage', weight: 2, maxPoints: 10, order: 2 },
];

const demoSubmission: Submission = {
  id: 'sub1',
  assignmentId: 'a1',
  authorId: 'u1',
  authorName: 'Иван Петров',
  createdAt: new Date().toISOString(),
  answers: {},
  status: 'RequiresReview',
};

const demoResults: CriterionResult[] = [
  { id: 'r1', submissionId: 'sub1', criterionId: 'c1', value: 1, assessmentType: 'SELF' },
  { id: 'r2', submissionId: 'sub1', criterionId: 'c1', value: 0, assessmentType: 'INSTRUCTOR' },
  { id: 'r3', submissionId: 'sub1', criterionId: 'c2', value: 80, assessmentType: 'SELF' },
  { id: 'r4', submissionId: 'sub1', criterionId: 'c2', value: 50, assessmentType: 'INSTRUCTOR' },
];

const demoGrades: StudentCourseGrade[] = [
  { studentId: 'u1', studentName: 'Иван Петров', finalScore: 86, finalGrade: 'A', calculatedAt: new Date().toISOString() },
  { studentId: 'u2', studentName: 'Мария Смирнова', finalScore: 74, finalGrade: 'B', calculatedAt: new Date().toISOString() },
];

const DemoNav = () => (
  <div className='flex gap-3 mb-5'>
    <Link to='/demo/criteria' className='px-3 py-2 rounded-lg bg-slate-900 text-white text-sm'>Критерии</Link>
    <Link to='/demo/assessment' className='px-3 py-2 rounded-lg bg-slate-900 text-white text-sm'>Оценка решения</Link>
    <Link to='/demo/grades' className='px-3 py-2 rounded-lg bg-slate-900 text-white text-sm'>Итоговые оценки</Link>
  </div>
);

export const DemoLinksPage: React.FC = () => (
  <div className='max-w-5xl mx-auto p-6'>
    <h1 className='text-2xl font-bold mb-2'>Демо-экраны критериев (mock)</h1>
    <p className='text-slate-600 mb-4'>Откройте отдельные страницы для демонстрации работы экранов без backend.</p>
    <DemoNav />
  </div>
);

export const DemoCriteriaPage: React.FC = () => {
  const [criteria, setCriteria] = useState<Criterion[]>(baseCriteria);

  return <div className='max-w-5xl mx-auto p-6 space-y-4'>
    <DemoNav />
    <CriteriaManagerPanel
      assignment={demoAssignment}
      criteria={criteria}
      isStudent={false}
      criteriaHidden={false}
      onAdd={(payload) => setCriteria((prev) => [...prev, { ...payload, id: `c${prev.length + 1}`, taskId: demoAssignment.id, order: prev.length + 1 }])}
      onUpdate={(criterionId, payload) => setCriteria((prev) => prev.map((c) => c.id === criterionId ? { ...c, ...payload } : c))}
      onDelete={(criterionId) => setCriteria((prev) => prev.filter((c) => c.id !== criterionId))}
    />
  </div>;
};

export const DemoAssessmentPage: React.FC = () => {
  const [results, setResults] = useState<CriterionResult[]>(demoResults);

  const nextResultId = useMemo(() => `r${results.length + 1}`, [results.length]);

  return <div className='max-w-5xl mx-auto p-6 space-y-4'>
    <DemoNav />
    <SubmissionAssessmentPanel
      submission={demoSubmission}
      criteria={baseCriteria}
      results={results}
      isTeacher={true}
      onUpsertInstructor={(criterionId, value) => {
        setResults((prev) => {
          const existing = prev.find((r) => r.criterionId === criterionId && r.assessmentType === 'INSTRUCTOR');
          if (existing) {
            return prev.map((r) => r.id === existing.id ? { ...r, value } : r);
          }
          return [...prev, { id: nextResultId, submissionId: demoSubmission.id, criterionId, value, assessmentType: 'INSTRUCTOR' }];
        });
      }}
    />
  </div>;
};

export const DemoCourseGradesPage: React.FC = () => {
  const [rows, setRows] = useState<StudentCourseGrade[]>(demoGrades);

  return <div className='max-w-5xl mx-auto p-6 space-y-4'>
    <DemoNav />
    <CourseGradesPanel
      rows={rows}
      onRecalculate={() => setRows((prev) => prev.map((r) => ({ ...r, finalScore: Math.min(100, r.finalScore + 1), calculatedAt: new Date().toISOString() })))}
    />
  </div>;
};
