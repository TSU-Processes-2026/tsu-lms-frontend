import { MultipleSelect } from '@/components/ui/MultipleSelect';
import { useCreateDraft } from '@/hooks/command/useCreateDraft';
import { useFetchDraft } from '@/hooks/command/useFetchDraft';
import { useLoadTeams } from '@/hooks/command/useLoadTeams';
import { mapErrorMessage } from '@/utils/messageMapper';
import { ArrowLeft, UserIcon, X } from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const DraftPage = () => {
    const { subjectId, teamId } = useParams();
    const { teams } = useLoadTeams(subjectId);

    const selectedCaptains = teams.find((item) => item.id == teamId);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [captains, setCaptains] = useState(selectedCaptains?.members || []);
    const [studentsList, setStudentsList] = useState<any[]>([]);

    const {
        students,
        errorMessage,
        isDraftSelected,
        message,
        handleSelectTeamCaptains,
        handleCreateDraft,
        checkIsLoading,
    } = useCreateDraft(subjectId ?? '');

    const { draft, isDraftLoading } = useFetchDraft(subjectId ?? '');

    const navigate = useNavigate();

    useEffect(() => {
        if (students) {
            const studentsShort =
                students.map((student) => ({
                    userId: student.userId,
                    username: student.username,
                })) || [];

            const allStudentsMap = new Map();
            studentsShort.forEach((student) => {
                allStudentsMap.set(student.userId, {
                    ...student,
                    isSelected: false,
                });
            });

            const allStudents = Array.from(allStudentsMap.values());
            setStudentsList(allStudents);
        }
    }, [students]);

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

        setCaptains(newTeamMembers);
    };

    const handleDeleteMember = (id: string) => {
        setCaptains((prev) => prev.filter((member) => member.userId !== id));

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

        const captainIds = captains.map((member) => member.userId);
        console.log('Selected captains: ', captainIds);
        handleSelectTeamCaptains({ memberIds: captainIds });
        await handleCreateDraft();
    };

    if (checkIsLoading() || isDraftLoading) {
        return <div>Загрузка...</div>;
    }

    if (draft) return;

    if (!isDraftSelected) {
        return (
            <div className='w-full mx-auto flex flex-col gap-4 relative'>
                <ArrowLeft
                    className='absolute left-0 top-0 text-gray-500 hover:text-blue-600 transition-all cursor-pointer'
                    onClick={() => {
                        navigate(-1);
                    }}
                />
                <div className='max-w-4xl w-full mx-auto'>
                    <h2 className='font-bold text-4xl mb-4'>Создание шаблонов команд</h2>
                    <div
                        className='bg-red-50 border-b-red-50 rounded-xl border
                     border-red-100  text-center my-8 py-8 backdrop-blur-sm shadow-md text-red-600 text-xl'
                    >
                        {'Выберите режим создания черновиков команд.'}
                    </div>
                </div>
            </div>
        );
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
                <h2 className='font-bold text-4xl mb-4'>Создание шаблонов команд</h2>
                <div className='flex border-b border-slate-200 mb-8 bg-white/60 backdrop-blur-sm rounded-3xl px-2 pt-2'>
                    <div className='flex-1 overflow-y-auto p-8'>
                        <form onSubmit={handleSubmit} className='space-y-5'>
                            <div className='space-y-3'>
                                {!studentsList || studentsList.length === 0 ? (
                                    <div className='text-center py-8 text-gray-500'>
                                        Нет доступных студентов для назначения
                                    </div>
                                ) : (
                                    <div>
                                        <MultipleSelect
                                            members={studentsList}
                                            selectedIds={selectedIds}
                                            onChange={handleSelectionChange}
                                            placeholder='Выберите капитанов'
                                        />
                                        <p className='mt-2 text-sm text-gray-500'>
                                            Всего студентов: {studentsList.length} | Выбрано:{' '}
                                            {selectedIds.length}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {studentsList && studentsList.length > 0 && (
                                <div className='space-y-3'>
                                    {!captains || captains.length === 0 ? (
                                        <div className='text-slate-400 text-center py-4'>
                                            Нет выбранных участников
                                        </div>
                                    ) : (
                                        captains.map((participant) => {
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
                            )}

                            {errorMessage && (
                                <div className='p-4 bg-red-50 border-b-red-50 rounded-xl border border-red-100'>
                                    <p className='text-xs text-red-700 font-semibold mb-1'>
                                        ❌ Ошибка
                                    </p>
                                    <p className='text-xs text-red-600'>
                                        {mapErrorMessage(errorMessage)}
                                    </p>
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
                                    type='submit'
                                    disabled={selectedIds.length === 0}
                                    className='flex-1 bg-linear-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-200/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0'
                                >
                                    Создать
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
