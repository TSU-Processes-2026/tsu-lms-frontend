import React, { useState } from 'react';
import { Criterion } from '@/types/assignments/criteria';

interface Props {
  criterion: Criterion;
  instructorValue?: number;
  selfValue?: number;
  instructorComment?: string;
  onAssess: (value: number, comment?: string) => void;
}

export const CriterionAssessCard: React.FC<Props> = ({
  criterion, instructorValue, selfValue, instructorComment, onAssess,
}) => {
  const [comment, setComment] = useState(instructorComment || '');

  const formatLabel = (fmt: string) =>
    fmt === 'checklist' ? 'Чеклист' : fmt === 'percentage' ? 'Проценты' : fmt === 'numeric' ? 'Число' : fmt === 'boolean' ? 'Да/Нет' : 'Шкала';

  const formatValue = (fmt: string, v?: number) => {
    if (v === undefined) return '—';
    if (fmt === 'checklist') return v ? 'Да' : 'Нет';
    if (fmt === 'percentage') return `${v}%`;
    if (fmt === 'boolean') return v ? 'Да' : 'Нет';
    return v;
  };

  return (
    <div className={`border rounded-xl p-4 ${criterion.isBonus ? 'border-emerald-200 bg-emerald-50/30' : criterion.isPenalty ? 'border-red-200 bg-red-50/30' : 'border-slate-200 bg-white'}`}>
      <div className='flex items-start justify-between gap-2'>
        <div className='flex-1'>
          <div className='font-semibold text-sm text-slate-800'>{criterion.description}</div>
          <div className='flex flex-wrap gap-1 mt-1'>
            {criterion.isBonus && <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700'>Бонус</span>}
            {criterion.isPenalty && <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700'>Штраф</span>}
            <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500'>{formatLabel(criterion.format)}</span>
            {criterion.weight != null && <span className='text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700'>Вес: {criterion.weight}</span>}
            {criterion.maxPoints != null && <span className='text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700'>Макс: {criterion.maxPoints}</span>}
            {criterion.minValue != null && <span className='text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-600'>Мин: {criterion.minValue}</span>}
          </div>
        </div>
      </div>
      <div className='mt-2 flex flex-wrap items-center gap-3 text-xs'>
        {selfValue !== undefined && (
          <span className='text-slate-500'>Самооценка: <strong>{formatValue(criterion.format, selfValue)}</strong></span>
        )}
        {instructorValue !== undefined && (
          <span className='text-blue-600'>Оценка: <strong>{formatValue(criterion.format, instructorValue)}</strong></span>
        )}
      </div>
      <div className='mt-3 space-y-2'>
        <div className='flex gap-2'>
          {criterion.format === 'checklist' ? (
            <>
              <button onClick={() => onAssess(1, comment)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${instructorValue === 1 ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>Да</button>
              <button onClick={() => onAssess(0, comment)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${instructorValue === 0 ? 'bg-red-600 text-white shadow-md' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>Нет</button>
            </>
          ) : criterion.format === 'boolean' ? (
            <>
              <button onClick={() => onAssess(1, comment)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${instructorValue === 1 ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>Да</button>
              <button onClick={() => onAssess(0, comment)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${instructorValue === 0 ? 'bg-red-600 text-white shadow-md' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>Нет</button>
            </>
          ) : criterion.format === 'percentage' ? (
            [0, 50, 100].map((v) => (
              <button key={v} onClick={() => onAssess(v, comment)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${instructorValue === v ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>{v}%</button>
            ))
          ) : (
            <input
              type='number'
              min={criterion.minValue ?? 0}
              max={criterion.maxPoints ?? 100}
              step='any'
              value={instructorValue ?? (criterion.minValue ?? 0)}
              onChange={(e) => {
                const min = criterion.minValue ?? 0;
                const max = criterion.maxPoints ?? 100;
                const val = Math.min(Math.max(Number(e.target.value), min), max);
                onAssess(val, comment);
              }}
              className='w-24 px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500'
            />
          )}
        </div>
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onBlur={() => instructorValue !== undefined && onAssess(instructorValue, comment)}
          placeholder='Комментарий по критерию...'
          className='w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all'
        />
      </div>
    </div>
  );
};
