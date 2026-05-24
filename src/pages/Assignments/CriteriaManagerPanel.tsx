import React, { useMemo, useState } from 'react';
import { Assignment } from '@/types/assignments/assignments';
import { Criterion } from '@/types/assignments/criteria';

interface Props {
    assignment: Assignment;
    criteria: Criterion[];
    isStudent: boolean;
    criteriaHidden: boolean;
    onAdd: (payload: Omit<Criterion, 'id' | 'taskId' | 'order'>) => void;
    onUpdate: (criterionId: string, payload: Partial<Omit<Criterion, 'id' | 'taskId' | 'order'>>) => void;
    onDelete: (criterionId: string) => void;
}

export const CriteriaManagerPanel: React.FC<Props> = ({
    assignment,
    criteria,
    isStudent,
    criteriaHidden,
    onAdd,
    onUpdate,
    onDelete,
}) => {
    const [description, setDescription] = useState('');
    const [format, setFormat] = useState<'checklist' | 'percentage'>('checklist');
    const [weight, setWeight] = useState('1');
    const [maxPoints, setMaxPoints] = useState('5');

    const sorted = useMemo(() => [...criteria].sort((a, b) => a.order - b.order), [criteria]);

    const submit = () => {
        if (!description.trim()) return;
        onAdd({ description: description.trim(), format, weight: Number(weight), maxPoints: Number(maxPoints), isBonus: false, isPenalty: false });
        setDescription('');
    };

    return <div className='bg-white border rounded-2xl p-5 space-y-4'>
        <h3 className='font-bold text-lg'>Критерии задания: {assignment.content.split('\n')[0]}</h3>
        {isStudent && criteriaHidden ? <p className='text-amber-700 text-sm'>Критерии будут доступны позже (логика self-assessment visibility).</p> : (
            <ul className='space-y-2'>
                {sorted.map((c) => <li key={c.id} className='p-3 rounded-xl bg-slate-50 text-sm'>
                    <div className='font-semibold'>{c.description}</div>
                    <div className='text-slate-500'>Формат: {c.format} • Вес: {c.weight ?? '—'} • Макс. балл: {c.maxPoints ?? '—'}</div>
                    {!isStudent && (
                        <div className='mt-2 flex gap-2'>
                            <button
                                onClick={() => onUpdate(c.id, { isBonus: !c.isBonus })}
                                className='px-2 py-1 text-xs rounded-lg bg-emerald-100 text-emerald-700'
                            >
                                Бонус: {c.isBonus ? 'Да' : 'Нет'}
                            </button>
                            <button
                                onClick={() => onUpdate(c.id, { isPenalty: !c.isPenalty })}
                                className='px-2 py-1 text-xs rounded-lg bg-amber-100 text-amber-700'
                            >
                                Штраф: {c.isPenalty ? 'Да' : 'Нет'}
                            </button>
                            <button
                                onClick={() => onDelete(c.id)}
                                className='px-2 py-1 text-xs rounded-lg bg-red-100 text-red-700'
                            >
                                Удалить
                            </button>
                        </div>
                    )}
                </li>)}
                {sorted.length === 0 && <li className='text-slate-500 text-sm'>Критерии пока не добавлены.</li>}
            </ul>
        )}

        {!isStudent && <div className='grid md:grid-cols-5 gap-2'>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder='Описание критерия' className='md:col-span-2 border rounded-xl px-3 py-2 text-sm' />
            <select value={format} onChange={(e) => setFormat(e.target.value as 'checklist' | 'percentage')} className='border rounded-xl px-3 py-2 text-sm'>
                <option value='checklist'>checklist</option>
                <option value='percentage'>percentage</option>
            </select>
            <input value={weight} onChange={(e) => setWeight(e.target.value)} className='border rounded-xl px-3 py-2 text-sm' placeholder='Вес' />
            <button onClick={submit} className='bg-blue-600 text-white rounded-xl px-3 py-2 text-sm font-semibold'>Добавить</button>
        </div>}
    </div>;
};
