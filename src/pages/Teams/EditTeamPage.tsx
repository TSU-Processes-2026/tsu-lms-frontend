import { MultipleSelect } from '@/components/ui/MultipleSelect';
import { useCreateTeamManually } from '@/hooks/command/useCreateTeamManually';
import { useLoadTeams } from '@/hooks/command/useLoadTeams';
import { useUpdateTeam } from '@/hooks/command/useUpdateTeam';
import { ArrowLeft, UserIcon, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const EditTeamPage = () => {
    const { subjectId, teamId } = useParams();
    const { teams } = useLoadTeams(subjectId);
    const { unassigned } = useCreateTeamManually(subjectId ?? '');
    const { isLoading, errorMessage, setErrorMessage, handleSelectTeamMembers, handleUpdateTeam } =
        useUpdateTeam(subjectId ?? '');
    const selectedTeam = teams.find((item) => item.id == teamId);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [teamMembers, setTeamMembers] = useState(selectedTeam?.members || []);
    const [studentsList, setStudentsList] = useState<any[]>([]);
    const navigate = useNavigate();
    useEffect(() => {
        if (selectedTeam?.members && unassigned?.students) {
            const unassignedStudents = unassigned.students || [];
            const teamStudents = selectedTeam.members || [];
            const allStudentsMap = new Map();

            unassignedStudents.forEach((student) => {
                allStudentsMap.set(student.userId, {
                    ...student,
                    isSelected: false,
                });
            });

            teamStudents.forEach((student) => {
                allStudentsMap.set(student.userId, {
                    ...student,
                    isSelected: true,
                });
            });

            const allStudents = Array.from(allStudentsMap.values());
            const selectedMemberIds = teamStudents.map((m) => m.userId);

            setStudentsList(allStudents);
            setTeamMembers(teamStudents);
            setSelectedIds(selectedMemberIds);
        }
    }, [unassigned, selectedTeam]);

    const handleSelectionChange = (newSelectedIds: string[]) => {
        setSelectedIds(newSelectedIds);
        setStudentsList((prev) =>
            prev.map((student) => ({
                ...student,
                isSelected: newSelectedIds.includes(student.userId),
            })),
        );

        const newTeamMembers = studentsList
            .filter((student) => newSelectedIds.includes(student.userId))
            .map(({ isSelected, ...student }) => student);

        setTeamMembers(newTeamMembers);
    };

    const handleDeleteMember = (id: string) => {
        setTeamMembers((prev) => prev.filter((member) => member.userId !== id));

        setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));

        setStudentsList((prev) =>
            prev.map((student) =>
                student.userId === id ? { ...student, isSelected: false } : student,
            ),
        );
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const memberIds = teamMembers.map((member) => member.userId);
        handleSelectTeamMembers({ memberIds });
        const res = await handleUpdateTeam(teamId ?? '');
        if (res) {
            setErrorMessage(null);
            setMessage('Состав команды обновлен успешно');
        } else {
            setMessage(null);
        }
    };

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className='w-full mx-auto flex flex-col gap-4 relative'>
            <ArrowLeft
                className='absolute left-0 top-0 text-gray-500 hover:text-blue-600 transition-all cursor-pointer'
                onClick={() => {
                    navigate(-1);
                }}
            />
            <div className='max-w-4xl w-full mx-auto'>
                <h2 className='font-bold text-4xl'>Редактирование состава команды</h2>
                <div className='flex border-b border-slate-200 mb-8 bg-white/60 backdrop-blur-sm rounded-3xl px-2 pt-2'>
                    <div className='flex-1 overflow-y-auto p-8'>
                        <div className='space-y-5'>
                            <div className='space-y-3'>
                                {!studentsList || studentsList.length === 0 ? (
                                    <div className='text-center py-8 text-gray-500'>
                                        Нет доступных студентов для распределения
                                    </div>
                                ) : (
                                    <div>
                                        <MultipleSelect
                                            members={studentsList}
                                            selectedIds={selectedIds}
                                            onChange={handleSelectionChange}
                                            placeholder='Поиск по имени...'
                                        />
                                        <p className='mt-2 text-sm text-gray-500'>
                                            Всего студентов: {studentsList.length} | Выбрано:{' '}
                                            {selectedIds.length}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className='space-y-3'>
                                <h3 className='font-semibold text-slate-700'>
                                    Выбранные участники:
                                </h3>
                                {!teamMembers || teamMembers.length === 0 ? (
                                    <div className='text-slate-400 text-center py-4'>
                                        Нет выбранных участников
                                    </div>
                                ) : (
                                    teamMembers.map((participant) => {
                                        return (
                                            <div
                                                key={participant.userId}
                                                className='flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all'
                                            >
                                                <div className='flex items-center gap-4'>
                                                    <div className='w-11 h-11 bg-linear-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md shrink-0'>
                                                        <UserIcon
                                                            size={20}
                                                            className='text-white'
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className='flex items-center gap-2 flex-wrap'>
                                                            <p className='font-bold text-slate-800'>
                                                                {participant.username}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    type='button'
                                                    onClick={() => {
                                                        handleDeleteMember(participant.userId);
                                                    }}
                                                    className='p-2 hover:bg-slate-100 rounded-full transition-colors'
                                                >
                                                    <X size={16} className='text-slate-400' />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {errorMessage && (
                                <div className='p-4 bg-red-50 border-b-red-50 rounded-xl border border-red-100'>
                                    <p className='text-xs text-red-700 font-semibold mb-1'>
                                        ❌ Ошибка
                                    </p>
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
                                    onClick={() => {
                                        navigate(-1);
                                    }}
                                    className='flex-1 px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200'
                                >
                                    Отмена
                                </button>
                                <button
                                    type='button'
                                    onClick={handleSubmit}
                                    disabled={selectedIds.length === 0}
                                    className='flex-1 bg-linear-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-200/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0'
                                >
                                    Сохранить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
