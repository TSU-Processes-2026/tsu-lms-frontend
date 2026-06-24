import React, { useEffect, useMemo, useState } from 'react';
import { Assignment } from '@/types/assignments/assignments';
import { AssessmentFormat, Criterion } from '@/types/assignments/criteria';

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
    const [formOpen, setFormOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [criterionType, setCriterionType] = useState<'active' | 'passive'>('active');
    const [format, setFormat] = useState<AssessmentFormat>('checklist');
    const [appliesTo, setAppliesTo] = useState<'student' | 'team' | 'both'>('student');
    const [gradingMode, setGradingMode] = useState<'five_point' | 'cumulative'>(
        assignment.maxPoints == null ? 'five_point' : 'cumulative',
    );
    const [weight, setWeight] = useState('1');
    const [maxPoints, setMaxPoints] = useState('5');
    const [minValue, setMinValue] = useState('0');
    const [isBonus, setIsBonus] = useState(false);
    const [isPenalty, setIsPenalty] = useState(false);
    const [isRequired, setIsRequired] = useState(false);
    const [isHiddenUntilVisibility, setIsHiddenUntilVisibility] = useState(false);

    const sorted = useMemo(() => [...criteria].sort((a, b) => a.order - b.order), [criteria]);

    useEffect(() => {
        setGradingMode(assignment.maxPoints == null ? 'five_point' : 'cumulative');
    }, [assignment.maxPoints]);

    const submit = () => {
        if (!description.trim()) return;
        onAdd({
            title: title.trim() || undefined,
            description: description.trim(),
            criterionType,
            format,
            appliesTo,
            weight: gradingMode === 'five_point' ? Number(weight) : undefined,
            maxPoints: gradingMode === 'cumulative' ? Number(maxPoints) : undefined,
            minValue: format === 'numeric' || format === 'scale' ? Number(minValue) : undefined,
            isBonus,
            isPenalty,
            isRequired,
            isHiddenUntilVisibility,
        });
        setTitle('');
        setDescription('');
        setIsBonus(false);
        setIsPenalty(false);
        setIsRequired(false);
        setIsHiddenUntilVisibility(false);
        setFormOpen(false);
    };

    const formatLabel = (fmt: AssessmentFormat) =>
        fmt === 'checklist' ? 'Чеклист' : fmt === 'percentage' ? 'Проценты' : fmt === 'numeric' ? 'Число' : fmt === 'boolean' ? 'Да/Нет' : 'Шкала';

    const typeLabel = (t: 'active' | 'passive') => (t === 'active' ? 'Активный' : 'Пассивный');

    const appliesLabel = (a: 'student' | 'team' | 'both') =>
        a === 'student' ? 'Студент' : a === 'team' ? 'Команда' : 'Оба';

    return <div className='bg-white border rounded-2xl p-5 space-y-4'>
        <h3 className='font-bold text-lg'>Критерии задания: {assignment.content.split('\n')[0]}</h3>
        {isStudent && criteriaHidden ? <p className='text-amber-700 text-sm'>Критерии будут доступны позже.</p> : (
            <ul className='space-y-2'>
                {sorted.map((c) => <li key={c.id} className='p-3 rounded-xl bg-slate-50 text-sm'>
                    <div className='font-semibold'>
                        {c.title && <span>{c.title}: </span>}
                        {c.description}
                    </div>
                    <div className='flex flex-wrap items-center gap-1 mt-1'>
                        {c.criterionType && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.criterionType === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {typeLabel(c.criterionType)}
                            </span>
                        )}
                        <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500'>
                            {formatLabel(c.format)}
                        </span>
                        {c.appliesTo && (
                            <span className='text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700'>{appliesLabel(c.appliesTo)}</span>
                        )}
                        <span className='text-slate-500 text-[10px]'>Вес: {c.weight ?? '—'} • Макс. балл: {c.maxPoints ?? '—'}</span>
                        {c.minValue != null && <span className='text-slate-500 text-[10px]'>Мин: {c.minValue}</span>}
                        {c.isRequired && <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700'>Обязательный</span>}
                        {c.isBonus && <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700'>Бонус</span>}
                        {c.isPenalty && <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700'>Штраф</span>}
                    </div>
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
                                onClick={() => onUpdate(c.id, { isRequired: !c.isRequired })}
                                className='px-2 py-1 text-xs rounded-lg bg-red-100 text-red-700'
                            >
                                Обязательный: {c.isRequired ? 'Да' : 'Нет'}
                            </button>
                            <button
                                onClick={() => onDelete(c.id)}
                                className='px-2 py-1 text-xs rounded-lg bg-red-200 text-red-800'
                            >
                                Удалить
                            </button>
                        </div>
                    )}
                </li>)}
                {sorted.length === 0 && <li className='text-slate-500 text-sm'>Критерии пока не добавлены.</li>}
            </ul>
        )}

        {!isStudent && (
            <div>
                <button
                    onClick={() => setFormOpen(!formOpen)}
                    className='px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white'
                >
                    {formOpen ? 'Скрыть форму' : 'Добавить критерий'}
                </button>
                {formOpen && (
                    <div className='mt-3 grid md:grid-cols-3 gap-2'>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder='Название' className='border rounded-xl px-3 py-2 text-sm' />
                        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder='Описание критерия' className='md:col-span-2 border rounded-xl px-3 py-2 text-sm' />
                        <select value={criterionType} onChange={(e) => setCriterionType(e.target.value as 'active' | 'passive')} className='border rounded-xl px-3 py-2 text-sm'>
                            <option value='active'>Активный</option>
                            <option value='passive'>Пассивный</option>
                        </select>
                        <select value={format} onChange={(e) => setFormat(e.target.value as AssessmentFormat)} className='border rounded-xl px-3 py-2 text-sm'>
                            <option value='checklist'>checklist</option>
                            <option value='percentage'>percentage</option>
                            <option value='numeric'>numeric</option>
                            <option value='boolean'>boolean</option>
                            <option value='scale'>scale</option>
                        </select>
                        <select value={appliesTo} onChange={(e) => setAppliesTo(e.target.value as 'student' | 'team' | 'both')} className='border rounded-xl px-3 py-2 text-sm'>
                            <option value='student'>Студент</option>
                            <option value='team'>Команда</option>
                            <option value='both'>Оба</option>
                        </select>
                        <select value={gradingMode} onChange={(e) => setGradingMode(e.target.value as 'five_point' | 'cumulative')} className='border rounded-xl px-3 py-2 text-sm'>
                            <option value='five_point'>five_point</option>
                            <option value='cumulative'>cumulative</option>
                        </select>
                        {gradingMode === 'five_point' ? (
                            <input value={weight} onChange={(e) => setWeight(e.target.value)} className='border rounded-xl px-3 py-2 text-sm' placeholder='Вес' />
                        ) : (
                            <input value={maxPoints} onChange={(e) => setMaxPoints(e.target.value)} className='border rounded-xl px-3 py-2 text-sm' placeholder='Макс. балл' />
                        )}
                        {(format === 'numeric' || format === 'scale') && (
                            <input value={minValue} onChange={(e) => setMinValue(e.target.value)} className='border rounded-xl px-3 py-2 text-sm' placeholder='Мин. значение' />
                        )}
                        <div className='flex flex-wrap items-center gap-3 text-xs'>
                            <label className='flex items-center gap-1 cursor-pointer'>
                                <input type='checkbox' checked={isBonus} onChange={() => setIsBonus(!isBonus)} className='accent-emerald-600' />
                                Бонус
                            </label>
                            <label className='flex items-center gap-1 cursor-pointer'>
                                <input type='checkbox' checked={isPenalty} onChange={() => setIsPenalty(!isPenalty)} className='accent-amber-600' />
                                Штраф
                            </label>
                            <label className='flex items-center gap-1 cursor-pointer'>
                                <input type='checkbox' checked={isRequired} onChange={() => setIsRequired(!isRequired)} className='accent-red-600' />
                                Обязательный
                            </label>
                            <label className='flex items-center gap-1 cursor-pointer'>
                                <input type='checkbox' checked={isHiddenUntilVisibility} onChange={() => setIsHiddenUntilVisibility(!isHiddenUntilVisibility)} className='accent-slate-600' />
                                Скрыт до видимости
                            </label>
                        </div>
                        <button onClick={submit} className='bg-blue-600 text-white rounded-xl px-3 py-2 text-sm font-semibold'>Добавить</button>
                    </div>
                )}
            </div>
        )}
    </div>;
};
