import React, { useEffect, useState } from 'react';
import { Subject, GradeScaleRange } from '@/types/subject/Subject';
import { updateSubject } from '@/api/subject/subject';
import { DEV_URL, PROD_URL, MOCK_URL } from '@/constants/config/config';
import { ACCESS_TOKEN } from '@/constants/auth/auth';
import { ClipboardCheck, Plus, Trash2, Save } from 'lucide-react';

interface Props {
    subject: Subject | null;
    subjectId: string;
    userRole: string;
    onUpdate: (subject: Subject) => void;
}

const API_BASE = DEV_URL || PROD_URL || MOCK_URL;

export const GradingSettings: React.FC<Props> = ({ subject, subjectId, userRole, onUpdate }) => {
    const [gradingMode, setGradingMode] = useState(subject?.gradingMode || 'five_point');
    const [selfAssessmentEnabled, setSelfAssessmentEnabled] = useState(subject?.selfAssessmentEnabled ?? false);
    const [gradeScales, setGradeScales] = useState<GradeScaleRange[]>([]);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const isAdmin = userRole === 'admin' || userRole === 'teacher';

    useEffect(() => {
        if (subject) {
            setGradingMode(subject.gradingMode || 'five_point');
            setSelfAssessmentEnabled(subject.selfAssessmentEnabled ?? false);
        }
    }, [subject]);

    useEffect(() => {
        const fetchGradeScale = async () => {
            const token = localStorage.getItem(ACCESS_TOKEN);
            if (!token || !subjectId) return;
            try {
                const res = await fetch(`${API_BASE}/courses/${subjectId}/grade-scale`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setGradeScales(Array.isArray(data) ? data : []);
                }
            } catch {}
        };
        fetchGradeScale();
    }, [subjectId]);

    const handleSaveSettings = async () => {
        if (!isAdmin) return;
        setSaving(true);
        setMessage(null);
        try {
            const updated = await updateSubject(subjectId, {
                gradingMode,
                selfAssessmentEnabled,
            });
            onUpdate(updated as Subject);
            setMessage({ type: 'success', text: 'Настройки сохранены' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Ошибка сохранения: ' + (err as Error).message });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveGradeScale = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE}/courses/${subjectId}/grade-scale`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ranges: gradeScales.map((s) => ({
                        minPoints: s.minPoints,
                        maxPoints: s.maxPoints,
                        grade: s.grade,
                    })),
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setGradeScales(Array.isArray(data) ? data : []);
                setMessage({ type: 'success', text: 'Шкала оценивания сохранена' });
            } else {
                setMessage({ type: 'error', text: 'Ошибка сохранения шкалы' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Ошибка: ' + (err as Error).message });
        }
    };

    const addScaleRow = () => {
        const max = gradeScales.reduce((m, r) => Math.max(m, r.maxPoints), 0);
        setGradeScales([...gradeScales, { minPoints: max, maxPoints: max + 10, grade: '' }]);
    };

    const updateScaleRow = (idx: number, patch: Partial<GradeScaleRange>) => {
        setGradeScales((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
    };

    const removeScaleRow = (idx: number) => {
        setGradeScales((prev) => prev.filter((_, i) => i !== idx));
    };

    const modeLabel = gradingMode === 'five_point' ? 'Пятибалльная' : 'Накопительная';

    return (
        <div className='space-y-8'>
            {message && (
                <div className={`p-4 rounded-xl text-sm font-semibold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            <div className='bg-white rounded-3xl p-6 shadow-lg border border-slate-100'>
                <h3 className='text-lg font-bold text-slate-800 mb-4 flex items-center gap-2'>
                    <ClipboardCheck size={20} className='text-blue-500' /> Режим оценивания
                </h3>
                <div className='space-y-4'>
                    <div>
                        <label className='block text-sm font-semibold text-slate-600 mb-2'>Режим оценивания курса</label>
                        <select
                            value={gradingMode}
                            onChange={(e) => setGradingMode(e.target.value)}
                            disabled={!isAdmin}
                            className='w-full md:w-64 px-4 py-2.5 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed'
                        >
                            <option value='five_point'>Пятибалльная (five_point)</option>
                            <option value='cumulative'>Накопительная (cumulative)</option>
                        </select>
                        <p className='text-xs text-slate-400 mt-1'>
                            {gradingMode === 'five_point'
                                ? 'Каждое задание оценивается по 5-балльной шкале. Итог = средний балл.'
                                : 'Баллы за задания суммируются. Итог переводится по шкале.'}
                        </p>
                    </div>

                    <div className='flex items-center gap-3'>
                        <label className='text-sm font-semibold text-slate-600'>Самооценка</label>
                        <button
                            onClick={() => setSelfAssessmentEnabled(!selfAssessmentEnabled)}
                            disabled={!isAdmin}
                            className={`relative w-12 h-6 rounded-full transition-all ${selfAssessmentEnabled ? 'bg-blue-600' : 'bg-slate-300'} ${!isAdmin ? 'opacity-60' : ''}`}
                        >
                            <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all shadow-sm ${selfAssessmentEnabled ? 'left-6' : 'left-0.5'}`} />
                        </button>
                        <span className='text-sm text-slate-600'>{selfAssessmentEnabled ? 'Включена' : 'Выключена'}</span>
                    </div>

                    {isAdmin && (
                        <button
                            onClick={handleSaveSettings}
                            disabled={saving}
                            className='px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2'
                        >
                            <Save size={16} /> {saving ? 'Сохранение...' : 'Сохранить настройки'}
                        </button>
                    )}
                </div>
            </div>

            {gradingMode === 'cumulative' && (
                <div className='bg-white rounded-3xl p-6 shadow-lg border border-slate-100'>
                    <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-bold text-slate-800 flex items-center gap-2'>
                            <ClipboardCheck size={20} className='text-emerald-500' /> Шкала перевода баллов
                        </h3>
                        <div className='text-sm text-slate-400'>Текущий режим: {modeLabel}</div>
                    </div>
                    <p className='text-sm text-slate-500 mb-4'>Определите диапазоны баллов для каждой оценки.</p>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='text-left text-slate-500 border-b'>
                                    <th className='pb-2 font-semibold'>От</th>
                                    <th className='pb-2 font-semibold'>До</th>
                                    <th className='pb-2 font-semibold'>Оценка</th>
                                    {isAdmin && <th className='pb-2 font-semibold'></th>}
                                </tr>
                            </thead>
                            <tbody>
                                {gradeScales.map((row, idx) => (
                                    <tr key={idx} className='border-b border-slate-50'>
                                        <td className='py-2'>
                                            <input
                                                type='number'
                                                value={row.minPoints}
                                                onChange={(e) => updateScaleRow(idx, { minPoints: Number(e.target.value) })}
                                                disabled={!isAdmin}
                                                className='w-24 px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60'
                                            />
                                        </td>
                                        <td className='py-2'>
                                            <input
                                                type='number'
                                                value={row.maxPoints}
                                                onChange={(e) => updateScaleRow(idx, { maxPoints: Number(e.target.value) })}
                                                disabled={!isAdmin}
                                                className='w-24 px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60'
                                            />
                                        </td>
                                        <td className='py-2'>
                                            <input
                                                value={row.grade}
                                                onChange={(e) => updateScaleRow(idx, { grade: e.target.value })}
                                                disabled={!isAdmin}
                                                className='w-24 px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60'
                                                placeholder='5, 4, A, B...'
                                            />
                                        </td>
                                        {isAdmin && (
                                            <td className='py-2'>
                                                <button onClick={() => removeScaleRow(idx)} className='p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all'>
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {isAdmin && (
                        <div className='flex gap-3 mt-4'>
                            <button onClick={addScaleRow} className='px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-all flex items-center gap-1'>
                                <Plus size={16} /> Добавить диапазон
                            </button>
                            <button onClick={handleSaveGradeScale} className='px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all flex items-center gap-1'>
                                <Save size={16} /> Сохранить шкалу
                            </button>
                        </div>
                    )}
                </div>
            )}

            {!isAdmin && (
                <div className='bg-white rounded-3xl p-6 shadow-lg border border-slate-100'>
                    <h3 className='text-lg font-bold text-slate-800 mb-2'>Информация об оценивании</h3>
                    <p className='text-sm text-slate-500'>Режим: {modeLabel}</p>
                    <p className='text-sm text-slate-500'>Самооценка: {selfAssessmentEnabled ? 'Включена' : 'Выключена'}</p>
                    {gradeScales.length > 0 && (
                        <div className='mt-3'>
                            <p className='text-sm font-semibold text-slate-600 mb-2'>Шкала оценивания:</p>
                            {gradeScales.map((row, idx) => (
                                <p key={idx} className='text-xs text-slate-500'>{row.minPoints}–{row.maxPoints} баллов → {row.grade}</p>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};