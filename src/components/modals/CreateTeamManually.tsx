import { UnAssignedStudents } from '@/types/command/Team';
import { MultipleSelect } from '../ui/MultipleSelect';
import { FormEvent, useEffect, useState } from 'react';
import { useCreateTeamManually } from '@/hooks/command/useCreateTeamManually';
import { useLoadConfig } from '@/hooks/command/useCommandConfig';

interface CreateTeamModalProps {
    onClose: () => void;
    subjectId: string;
    role: string;
}

export const CreateTeamManually = ({ onClose, subjectId, role }: CreateTeamModalProps) => {
    const {
        unassigned,
        isLoading,
        isCreating,
        errorMessage,
        setErrorMessage,
        processCreateRequest,
    } = useCreateTeamManually(subjectId);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [loadedUnassigned, setLoaded] = useState<UnAssignedStudents>(unassigned);
    const { config } = useLoadConfig(subjectId, role);
    const handleTeamMaxSize = (): number => {
        if (config.fixedTeamSize) return config.fixedTeamSize;
        if (config.maxTeamSize) return config.maxTeamSize;
        return 0;
    };
    const handleSelectionChange = (selectedIds: string[]) => {
        setSelectedIds(selectedIds);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const fixedTeamSize = handleTeamMaxSize();
        if (selectedIds.length > fixedTeamSize) {
            setErrorMessage(
                'Указано слишком большое число участников. Максимальное число участников: ' +
                    fixedTeamSize,
            );
            return;
        }
        const res = await processCreateRequest({ memberIds: selectedIds });
        if (res) {
            setErrorMessage(null);
            setLoaded((prev) => ({
                ...prev,
                students: prev.students.filter((student) => !selectedIds.includes(student.userId)),
            }));
            setSelectedIds([]);
            setMessage('Сформирована новая команда');
        } else {
            setMessage(null);
        }
    };
    useEffect(() => {
        setLoaded({ ...unassigned });
    }, [unassigned]);
    if (isLoading) {
        return (
            <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
                <div className='bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden'>
                    <div className='px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0'>
                        <div>
                            <h3 className='text-xl font-bold text-slate-800'>
                                Выберите участников для формирования команды
                            </h3>
                        </div>
                        <button
                            className='p-2 hover:bg-slate-100 rounded-full transition-colors'
                            onClick={onClose}
                        >
                            ✕
                        </button>
                    </div>
                    <div className='flex-1 overflow-y-auto p-8'>
                        <form onSubmit={handleSubmit} className='space-y-5'>
                            <div className='text-center py-8 text-gray-500'>Загрузка...</div>

                            <div className='flex gap-3 pt-8'>
                                <button
                                    type='button'
                                    onClick={onClose}
                                    className='flex-1 px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200'
                                >
                                    Отмена
                                </button>
                                <button
                                    type='submit'
                                    disabled={true}
                                    className='flex-1 bg-linear-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-200/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0'
                                >
                                    Создать ({selectedIds.length})
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
            <div className='bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden'>
                <div className='px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0'>
                    <div>
                        <h3 className='text-xl font-bold text-slate-800'>
                            Выберите участников для формирования команды
                        </h3>
                    </div>
                    <button
                        className='p-2 hover:bg-slate-100 rounded-full transition-colors'
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                <div className='flex-1 overflow-y-auto p-8'>
                    <form onSubmit={handleSubmit} className='space-y-5'>
                        <div className='space-y-3'>
                            {!loadedUnassigned?.students ||
                            loadedUnassigned.students.length === 0 ? (
                                <div className='text-center py-8 text-gray-500'>
                                    Нет доступных студентов для распределения
                                </div>
                            ) : (
                                <div>
                                    <MultipleSelect
                                        members={loadedUnassigned.students}
                                        selectedIds={selectedIds}
                                        onChange={handleSelectionChange}
                                        placeholder='Поиск по имени...'
                                    />
                                    <p className='mt-2 text-sm text-gray-500'>
                                        Студентов без команды: {loadedUnassigned.students.length}
                                    </p>
                                </div>
                            )}
                        </div>
                        {errorMessage && (
                            <div className='p-4 bg-red-50 border-b-red-50 rounded-xl border border-red-100'>
                                <p className='text-xs text-red-700 font-semibold mb-1'>❌ Ошибка</p>
                                <p className='text-xs text-red-600'>{errorMessage}</p>
                            </div>
                        )}
                        {message && (
                            <div className='p-4 bg-green-50 border-b-green-50 rounded-xl border border-green-100'>
                                <p className='text-xs text-green-700 font-semibold mb-1'>
                                    ✅ Успех
                                </p>
                                <p className='text-xs text-green-600'>{message}</p>
                            </div>
                        )}
                        <div className='flex gap-3 pt-8'>
                            <button
                                type='button'
                                onClick={onClose}
                                className='flex-1 px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200'
                            >
                                Отмена
                            </button>
                            <button
                                type='submit'
                                disabled={selectedIds.length === 0 || isCreating}
                                className='flex-1 bg-linear-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-200/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0'
                            >
                                Создать ({selectedIds.length})
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
