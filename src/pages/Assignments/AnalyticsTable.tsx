import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Download, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { DEV_URL, PROD_URL, MOCK_URL } from '@/constants/config/config';
import { ACCESS_TOKEN } from '@/constants/auth/auth';
import { CourseAnalyticsResponse, StudentAnalyticsRow, TaskGradeCell } from '@/types/assignments/reviews';

const API_BASE = DEV_URL || PROD_URL || MOCK_URL;

interface AnalyticsTableProps {
    courseId: string;
    isTeacherOrAdmin: boolean;
}

type SortDir = 'asc' | 'desc';

const sourceLabel: Record<string, string> = {
    peer: 'Peer',
    teacher: 'Teacher',
    mixed: 'Mixed',
};

const sourceBg: Record<string, string> = {
    peer: 'bg-emerald-100 text-emerald-700',
    teacher: 'bg-blue-100 text-blue-700',
    mixed: 'bg-purple-100 text-purple-700',
};

const cellTint: Record<string, string> = {
    peer: 'bg-emerald-50',
    teacher: 'bg-blue-50',
    mixed: 'bg-purple-50',
};

const finalGradeColor = (score: number): string => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    return 'text-red-600';
};

export const AnalyticsTable: React.FC<AnalyticsTableProps> = ({ courseId, isTeacherOrAdmin }) => {
    const [data, setData] = useState<CourseAnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [recalculating, setRecalculating] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    const fetchAnalytics = useCallback(async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/courses/${courseId}/analytics`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return;
            const json: CourseAnalyticsResponse = await res.json();
            setData(json);
        } catch {
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const handleRecalculate = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) return;
        setRecalculating(true);
        try {
            await fetch(`${API_BASE}/courses/${courseId}/calculate-grades`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchAnalytics();
        } catch {
        } finally {
            setRecalculating(false);
        }
    };

    const handleExport = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) return;
        setExporting(true);
        try {
            const res = await fetch(`${API_BASE}/courses/${courseId}/grades/export`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return;
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-${courseId}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch {
        } finally {
            setExporting(false);
        }
    };

    const toggleSort = (taskId: string) => {
        if (sortKey === taskId) {
            setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(taskId);
            setSortDir('asc');
        }
    };

    const getSortIcon = (taskId: string) => {
        if (sortKey !== taskId) return null;
        return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
    };

    const sortedRows = React.useMemo(() => {
        if (!data || !sortKey) return data?.rows ?? [];
        const rows = [...data.rows];
        rows.sort((a, b) => {
            const cellA = a.taskGrades.find((c) => c.taskId === sortKey);
            const cellB = b.taskGrades.find((c) => c.taskId === sortKey);
            const scoreA = cellA?.score ?? -1;
            const scoreB = cellB?.score ?? -1;
            return sortDir === 'asc' ? scoreA - scoreB : scoreB - scoreA;
        });
        return rows;
    }, [data, sortKey, sortDir]);

    const taskTitles = data?.taskTitles ?? [];
    const rows = sortedRows;

    return (
        <div className='bg-white rounded-3xl p-6 shadow-lg border border-slate-100'>
            <div className='flex flex-wrap items-center justify-between gap-3 mb-4'>
                <div className='flex items-center gap-3'>
                    <BarChart3 size={20} className='text-blue-600' />
                    <h3 className='font-bold text-lg text-slate-800'>Сводная аналитика</h3>
                </div>
                {isTeacherOrAdmin && (
                    <div className='flex items-center gap-3'>
                        <button
                            className='px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all flex items-center gap-1.5 disabled:opacity-50'
                            onClick={handleRecalculate}
                            disabled={recalculating}
                        >
                            <RefreshCw size={14} className={recalculating ? 'animate-spin' : ''} />
                            {recalculating ? 'Пересчёт...' : 'Пересчитать'}
                        </button>
                        <button
                            className='px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all flex items-center gap-1.5 disabled:opacity-50'
                            onClick={handleExport}
                            disabled={exporting}
                        >
                            <Download size={14} />
                            CSV
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className='text-center py-10 text-slate-400 text-sm'>Загрузка данных...</div>
            ) : !data || rows.length === 0 ? (
                <div className='text-center py-10 text-slate-400 text-sm'>
                    Нет данных для отображения. Запустите пересчёт оценок.
                </div>
            ) : (
                <div className='overflow-x-auto'>
                    <table className='w-full text-sm border-separate border-spacing-0'>
                        <thead>
                            <tr className='text-left text-slate-500'>
                                <th className='sticky left-0 z-10 bg-white pb-3 font-semibold border-b min-w-[180px]'>
                                    Студент
                                </th>
                                {taskTitles.map((title, idx) => {
                                    const taskId = data.rows[0]?.taskGrades[idx]?.taskId ?? title;
                                    return (
                                        <th
                                            key={taskId}
                                            className='pb-3 font-semibold border-b px-2 min-w-[120px] cursor-pointer select-none hover:text-slate-700'
                                            onClick={() => toggleSort(taskId)}
                                        >
                                            <div className='flex items-center gap-1 justify-center'>
                                                <span className='truncate max-w-[100px]'>{title}</span>
                                                {getSortIcon(taskId)}
                                            </div>
                                        </th>
                                    );
                                })}
                                <th className='pb-3 font-semibold border-b px-2 min-w-[120px] text-center'>
                                    Итоговая
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.studentId} className='hover:bg-slate-50 transition-colors'>
                                    <td className='sticky left-0 z-10 bg-white py-3 font-medium text-slate-800 border-b border-slate-100'>
                                        {row.studentName}
                                    </td>
                                    {row.taskGrades.map((cell) => (
                                        <td
                                            key={cell.taskId}
                                            className={`py-3 px-2 text-center border-b border-slate-100 ${cell.source ? cellTint[cell.source] ?? '' : 'bg-gray-50/30'}`}
                                        >
                                            {cell.score !== undefined && cell.score !== null ? (
                                                <>
                                                    <div className='text-base font-bold text-slate-800'>
                                                        {cell.score}
                                                    </div>
                                                    <div className='mt-1'>
                                                        <span
                                                            className={`inline-block px-2 py-0.5 rounded-lg text-xs font-semibold ${sourceBg[cell.source ?? ''] ?? 'bg-gray-200 text-gray-500'}`}
                                                        >
                                                            {sourceLabel[cell.source ?? ''] ?? '—'}
                                                        </span>
                                                    </div>
                                                    <div className='mt-0.5 text-xs text-slate-400'>
                                                        {cell.reviewerCount}{' '}
                                                        {cell.reviewerCount === 1
                                                            ? 'проверка'
                                                            : cell.reviewerCount >= 2 && cell.reviewerCount <= 4
                                                            ? 'проверки'
                                                            : 'проверок'}
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className='text-base font-bold text-slate-400'>—</div>
                                                    <div className='mt-1'>
                                                        <span className='inline-block px-2 py-0.5 rounded-lg text-xs font-semibold bg-gray-200 text-gray-500'>
                                                            —
                                                        </span>
                                                    </div>
                                                    <div className='mt-0.5 text-xs text-slate-400'>
                                                        {cell.reviewerCount}{' '}
                                                        {cell.reviewerCount === 1
                                                            ? 'проверка'
                                                            : cell.reviewerCount >= 2 && cell.reviewerCount <= 4
                                                            ? 'проверки'
                                                            : 'проверок'}
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    ))}
                                    <td className='py-3 px-2 text-center border-b border-slate-100'>
                                        {row.finalCourseGrade !== undefined && row.finalCourseGrade !== null ? (
                                            <span
                                                className={`text-base font-bold ${finalGradeColor(row.finalCourseGrade)}`}
                                            >
                                                {row.finalCourseGrade}
                                            </span>
                                        ) : (
                                            <span className='text-base text-slate-400'>—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
