import React, { useState } from 'react';
import { Download, Users, Star } from 'lucide-react';
import { StudentCourseGrade } from '@/types/assignments/criteria';

const sourceBadge: Record<string, { label: string; cls: string }> = {
    peer: { label: 'Peer', cls: 'bg-emerald-100 text-emerald-700' },
    teacher: { label: 'Teacher', cls: 'bg-blue-100 text-blue-700' },
    mixed: { label: 'Mixed', cls: 'bg-purple-100 text-purple-700' },
};

interface Props {
  rows: StudentCourseGrade[];
  onRecalculate: () => void;
  onExport?: () => void;
  subjects?: { id: string; title: string }[];
  selectedSubjectId?: string;
  onSelectSubject?: (subjectId: string) => void;
  isTeacher?: boolean;
  currentUserId?: string;
}

export const CourseGradesPanel: React.FC<Props> = ({ rows, onRecalculate, onExport, subjects = [], selectedSubjectId, onSelectSubject, isTeacher = true, currentUserId }) => {
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const subject = subjects.find((s) => s.id === selectedSubjectId);
  const displayRows = isTeacher ? rows : rows.filter((r) => r.studentId === currentUserId);
  const avgScore = displayRows.length > 0 ? (displayRows.reduce((s, r) => s + Number(r.finalScore), 0) / displayRows.length).toFixed(2) : '—';
  const passed = displayRows.filter((r) => Number(r.finalScore) >= 60).length;

  return (
    <div className='bg-white border rounded-2xl p-5 shadow-sm'>
      <div className='flex flex-wrap items-center justify-between gap-3 mb-4'>
        <div className='flex items-center gap-3'>
          <h3 className='font-bold text-lg text-slate-800'>Итоговые оценки</h3>
          {subjects.length > 1 && onSelectSubject && (
            <select
              value={selectedSubjectId || ''}
              onChange={(e) => onSelectSubject(e.target.value)}
              className='px-3 py-1.5 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500'
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          )}
        </div>
        <div className='flex items-center gap-3'>
          {isTeacher && (
            <div className='flex gap-3 text-xs'>
              <span className='px-3 py-1.5 bg-slate-100 rounded-lg font-semibold text-slate-600'>Средний: {avgScore}</span>
              <span className='px-3 py-1.5 bg-emerald-100 rounded-lg font-semibold text-emerald-700'>Сдали: {passed}/{displayRows.length}</span>
            </div>
          )}
          <button className='px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all' onClick={onRecalculate}>Пересчитать</button>
          {isTeacher && onExport && (
            <button className='px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all flex items-center gap-1' onClick={onExport}>
              <Download size={14} /> CSV
            </button>
          )}
        </div>
      </div>
      {displayRows.length === 0 ? (
        <div className='text-center py-8 text-slate-400 text-sm'>Нет оценок. Нажмите "Пересчитать" для расчёта.</div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='text-left text-slate-500 border-b'>
                <th className='pb-2 font-semibold'>Студент</th>
                <th className='pb-2 font-semibold'>Итоговый балл</th>
                <th className='pb-2 font-semibold'>Оценка</th>
                <th className='pb-2 font-semibold'>Источник</th>
                <th className='pb-2 font-semibold'>Проверок</th>
                <th className='pb-2 font-semibold'>Пересчитано</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row) => (
                <React.Fragment key={row.studentId}>
                  <tr
                    className='border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors'
                    onClick={() => setExpandedStudent(expandedStudent === row.studentId ? null : row.studentId)}
                  >
                    <td className='py-3 font-medium text-slate-800'>{row.studentName ?? row.studentId}</td>
                    <td className='py-3'>{Number(row.finalScore).toFixed(2)}</td>
                    <td className='py-3'>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${Number(row.finalScore) >= 80 ? 'bg-emerald-100 text-emerald-700' : Number(row.finalScore) >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {row.finalGrade}
                      </span>
                    </td>
                    <td className='py-3'>
                      {row.finalSource && sourceBadge[row.finalSource] ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${sourceBadge[row.finalSource].cls}`}>
                          <Star size={10} />
                          {sourceBadge[row.finalSource].label}
                        </span>
                      ) : (
                        <span className='text-slate-400 text-xs'>—</span>
                      )}
                    </td>
                    <td className='py-3'>
                      {row.reviewerCount !== undefined && row.reviewerCount !== null ? (
                        <span className='inline-flex items-center gap-1 text-xs text-slate-500'>
                          <Users size={12} />
                          {row.reviewerCount}
                        </span>
                      ) : (
                        <span className='text-slate-400 text-xs'>—</span>
                      )}
                    </td>
                    <td className='py-3 text-slate-400 text-xs'>{new Date(row.calculatedAt).toLocaleString()}</td>
                  </tr>
                  {expandedStudent === row.studentId && subject && (
                    <tr className='bg-slate-50'>
                      <td colSpan={6} className='p-4'>
                        <div className='text-xs text-slate-500 space-y-1'>
                          <p>Курс: {subject.title}</p>
                          <p>Итоговый балл: {Number(row.finalScore).toFixed(2)}</p>
                          <p>Оценка: {row.finalGrade}</p>
                          <p>Источник: {row.finalSource ? sourceBadge[row.finalSource]?.label ?? row.finalSource : '—'}</p>
                          <p>Проверок: {row.reviewerCount ?? '—'}</p>
                          <p>Рассчитано: {new Date(row.calculatedAt).toLocaleString()}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
