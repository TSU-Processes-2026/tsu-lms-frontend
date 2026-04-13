import { SingleSelect } from '@/components/ui/Select';
import { useFetchCaptainVotingStatus, useVoteForCaptain } from '@/hooks/captain/useCaptainVoting';
import { useLoadTeams } from '@/hooks/command/useLoadTeams';
import { TeamMember } from '@/types/command/Team';
import { dateTimeFormatter } from '@/utils/dateTimeTransformer';
import { mapErrorMessage } from '@/utils/messageMapper';
import { ArrowLeft } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const CaptainVotingPage = () => {
    const { subjectId, teamId, currentUserId } = useParams();
    const { teams } = useLoadTeams(subjectId);
    const selectedTeam = teams.find((item) => item.id == teamId);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [studentsList, setStudentsList] = useState<any[]>([]);

    const {} = useFetchCaptainVotingStatus(subjectId ?? '', teamId ?? '', true);
    const {
        votingStatus,
        errorMessage: fetchError,
        isLoading: fetchLoading,
        updateVotingRes,
    } = useFetchCaptainVotingStatus(subjectId ?? '', teamId ?? '', true);

    const { errorMessage, isLoading, handleVoteForCaptain } = useVoteForCaptain(
        subjectId ?? '',
        teamId ?? '',
        true,
        votingStatus?.hasCurrentUserVoted ?? true,
    );
    const findWinner = (): TeamMember | null => {
        if (votingStatus && votingStatus.winnerId && selectedTeam) {
            return selectedTeam.members.filter(
                (member) => member.userId === votingStatus.winnerId,
            )[0];
        }
        return null;
    };
    const winner: TeamMember | null = findWinner();
    const navigate = useNavigate();

    const handleSelectionChange = (newSelectedId: string | null) => {
        setSelectedId(newSelectedId);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const res: boolean = await handleVoteForCaptain(selectedId ?? '');
        if (res) {
            updateVotingRes();
            setMessage('Голос отправлен. Капитан будет назначен после завершения дедлайна.');
        } else {
            setMessage(null);
        }
    };

    useEffect(() => {
        const winner = findWinner();
        if (winner) {
        }
        if (votingStatus?.hasCurrentUserVoted)
            setMessage('Голос отправлен. Капитан будет назначен после завершения дедлайна.');
        if (selectedTeam?.members) {
            const teamStudents =
                selectedTeam.members.filter((member) => member.userId != currentUserId) || [];
            const allStudentsMap = new Map();

            teamStudents.forEach((student) => {
                allStudentsMap.set(student.userId, {
                    ...student,
                    isSelected: false,
                });
            });

            const allStudents = Array.from(allStudentsMap.values());
            const selectedMemberId = teamStudents.filter((m) => m.userId)[0];

            setStudentsList(allStudents);

            setSelectedId(selectedMemberId.userId);
        }
    }, [selectedTeam]);

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
                <h2 className='font-bold text-4xl'>Голосование за назначение капитана</h2>
                <div className='flex border-b border-slate-300 mb-8 bg-white backdrop-blur-sm rounded-3xl my-4 box-border overflow-hidden'>
                    <div className='flex-1 flex flex-row items-start'>
                        <div className='flex flex-1 flex-col items-start box-border pl-4 pt-4'>
                            <span className='text-lg font-semibold flex flex-row gap-2'>
                                <p>Статус: </p>{' '}
                                {votingStatus?.isClosed ? (
                                    <p className='text-amber-700 font-bold'> Завершен</p>
                                ) : (
                                    <p className='text-green-600 font-bold'> Открыт</p>
                                )}
                            </span>
                            <span className='text-lg font-semibold'>
                                Начало: {dateTimeFormatter(votingStatus?.startedAt)}
                            </span>
                            <span className='text-lg font-semibold'>
                                Дедлайн: {dateTimeFormatter(votingStatus?.deadlineAt)}
                            </span>
                            <span className='text-lg font-semibold'>
                                Число голосов: {votingStatus?.votesCast} из{' '}
                                {votingStatus?.totalMembers && votingStatus?.totalMembers - 1}
                            </span>
                            {winner && (
                                <span className='text-lg font-semibold flex flex-row gap-2 mt-8'>
                                    Победитель:{' '}
                                    <p className='text-amber-700 font-bold'>{winner.username}</p>
                                </span>
                            )}
                        </div>
                        <div className='flex-2 px-4 py-4 h-full bg-blue-50  border border-blue-100'>
                            <p className='text-lg text-blue-700 font-semibold mb-1'>
                                ℹ️ Правила голосования
                            </p>
                            <p className='text-sm text-blue-600'>
                                1. Голосование доступно{' '}
                                <span className='font-bold'>до наступления дедлайна</span>
                            </p>
                            <p className='text-sm text-blue-600'>
                                2. Проголосовать можно только{' '}
                                <span className='font-bold'>1 раз</span>.
                            </p>
                            <p className='text-sm text-blue-600'>
                                3. Голосовать <span className='font-bold'>за себя нельзя</span>.
                            </p>
                            <p className='text-sm text-blue-600'>
                                4. При перевесе по количеству голосов за выдвинутого кандидата он
                                назначается капитаном и голосование завершается{' '}
                                <span className='font-bold'>досрочно</span>.
                            </p>

                            <p className='text-sm text-blue-600'>
                                5. При равном количестве голосов капитан назначается{' '}
                                <span className='font-bold'>случайно</span> и голосование
                                завершается
                            </p>
                        </div>
                    </div>
                </div>
                <div className='flex border-b border-slate-300 mb-8 bg-white backdrop-blur-xl rounded-3xl px-2 pt-2'>
                    <div className='flex-1 overflow-y-auto p-8'>
                        <div className='space-y-5'>
                            <div className='space-y-3'>
                                <div>
                                    <SingleSelect
                                        members={studentsList}
                                        selectedId={selectedId}
                                        label='Укажите имя кандидата'
                                        onChange={handleSelectionChange}
                                        placeholder='Поиск по имени...'
                                    />
                                </div>
                            </div>
                            {(errorMessage || fetchError) && (
                                <div className='p-4 bg-red-50 border-b-red-50 rounded-xl border border-red-100'>
                                    <p className='text-xs text-red-700 font-semibold mb-1'>
                                        ❌ Ошибка
                                    </p>
                                    <p className='text-xs text-red-600'>
                                        {mapErrorMessage(errorMessage || fetchError)}
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
                                    Назад
                                </button>
                                {!votingStatus?.hasCurrentUserVoted && !votingStatus?.isClosed && (
                                    <button
                                        type='button'
                                        onClick={handleSubmit}
                                        disabled={!selectedId}
                                        className='flex-1 bg-linear-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-200/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0'
                                    >
                                        Проголосовать
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
