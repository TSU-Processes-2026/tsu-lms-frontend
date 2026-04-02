import { TeamMember } from '@/types/command/Team';
import { MultipleSelect } from '../ui/MultipleSelect';
import { useState } from 'react';
import { useCreateTeamManually } from '@/hooks/command/useCreateTeamManually';
import { useParams } from 'react-router-dom';

interface CreateTeamModalProps {
    onClose: () => void;
    subjectId: string;
    fixedTeamSize: number;
}

export const CreateTeamManually = ({ onClose, subjectId, fixedTeamSize }: CreateTeamModalProps) => {
    const { unassigned, isLoading } = useCreateTeamManually(subjectId);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const handleSelectionChange = (selectedIds: string[]) => {
        setSelectedIds(selectedIds);
    };

    if (isLoading) {
        return (
            <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
                <div className='bg-white w-full max-w-2xl p-8 rounded-3xl text-center'>
                    <p>Загрузка...</p>
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
                    <div className='space-y-3'>
                        {!unassigned?.students || unassigned.students.length === 0 ? (
                            <div className='text-center py-8 text-gray-500'>
                                Нет доступных студентов для распределения
                            </div>
                        ) : (
                            <div>
                                <MultipleSelect
                                    members={unassigned.students}
                                    selectedIds={selectedIds}
                                    onChange={handleSelectionChange}
                                    placeholder='Поиск по имени...'
                                />
                                <p className='mt-2 text-sm text-gray-500'>
                                    Студентов без команды: {unassigned.students.length}
                                </p>
                            </div>
                        )}
                    </div>
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
                            disabled={selectedIds.length === 0}
                            className='flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-200/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0'
                        >
                            Создать ({selectedIds.length})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
