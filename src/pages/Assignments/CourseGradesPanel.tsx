import React from 'react';
import { StudentCourseGrade } from '@/types/assignments/criteria';

interface Props {
  rows: StudentCourseGrade[];
  onRecalculate: () => void;
}

export const CourseGradesPanel: React.FC<Props> = ({ rows, onRecalculate }) => (
  <div className='bg-white border rounded-2xl p-5'>
    <div className='flex items-center justify-between mb-3'>
      <h3 className='font-bold text-lg'>Итоговые оценки студентов</h3>
      <button className='px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold' onClick={onRecalculate}>Принудительный пересчет</button>
    </div>
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead><tr className='text-left text-slate-500'><th>Студент</th><th>Итоговый балл</th><th>Оценка</th><th>Пересчитано</th></tr></thead>
        <tbody>
          {rows.map((row) => <tr key={row.studentId} className='border-t'><td className='py-2'>{row.studentName ?? row.studentId}</td><td>{row.finalScore}</td><td>{row.finalGrade}</td><td>{new Date(row.calculatedAt).toLocaleString()}</td></tr>)}
        </tbody>
      </table>
    </div>
  </div>
);
