import { useStudentsDistribution } from '@/hooks/command/useStudentDistribution';
import { TeamConfig } from '@/types/command/CommandConfig';
import { Team } from '@/types/command/Team';
import { buildRandomVotes, resolveCaptainVoting } from '@/utils/captainVoting';
import { Crown, UserIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CommandParticipantsModalProps {
    commandNumber: number;
    onClose: () => void;
    teams: Team[];
    currentUserId: string;
    commandId: string;
    role: string;
    config: TeamConfig;
    currentDistributionMode: string;
    onTeamUpdate: (teamId: string, updater: (team: Team) => Team) => void;
}

const CommandParticipantsModal = ({
    onClose,
    commandNumber,
    teams,
    currentUserId,
    commandId,
    role,
    config,
    currentDistributionMode,
    onTeamUpdate,
}: CommandParticipantsModalProps) => {
    const members: Team = useMemo(
        () =>
            teams !== undefined && teams.length > 0
                ? teams.filter((item) => item.id === commandId)[0]
                : {
                      id: '',
                      subjectId: '',
                      memberIds: [],
                      members: [],
                      captainId: null,
                  },
        [teams, commandId],
    );
    const subjectId: string = config.subjectId;
    const { handleJoin, errorMessage, handleLeave } = useStudentsDistribution(subjectId, commandId);
    const [isMember, setIsMember] = useState<boolean>(false);
    const [isMemberOfAnyTeam, setIsMemberOfAnyTeam] = useState<boolean>(false);

    const checkIsInAnyTeam = () => {
        const isInAnyTeam = teams.some((team) => {
            return (
                team.members.some((member) => member.userId == currentUserId) ||
                team.memberIds.some((id) => id === currentUserId)
            );
        });
        setIsMemberOfAnyTeam(isInAnyTeam);
    };

    const handleInTeam = () => {
        const found = members.members.filter((member) => member.userId === currentUserId);
        setIsMember(found && found.length > 0);
    };

    useEffect(() => {
        handleInTeam();
    }, [members]);

    useEffect(() => {
        checkIsInAnyTeam();
    }, [teams]);

    const [message, setMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const isTeacher = role !== 'student';
    const isStudent = role === 'student';
    const isFinalized = config.isFinalized;
    const isStudentsModeEnabled = currentDistributionMode === 'Students';
    const couldViewJoinInterface = isStudent && isStudentsModeEnabled && !isFinalized;
    const isCaptainVotingMode =
        config.captainEnabled &&
        (config.distributionMode === 'Random' || config.distributionMode === 'Manual');

    const handleJoinClick = async (): Promise<void> => {
        try {
            const updatedTeam: Team = await handleJoin();
            onTeamUpdate(updatedTeam.id, () => {
                return { ...updatedTeam };
            });
        } catch (error) {}
    };

    const handleLeaveClick = async (): Promise<void> => {
        try {
            const updatedTeam: Team = await handleLeave();
            onTeamUpdate(updatedTeam.id, () => {
                return { ...updatedTeam };
            });
        } catch (error) {}
    };

    const captain = useMemo(
        () =>
            members.members.find((participant) => participant.userId === members.captainId) ?? null,
        [members.members, members.captainId],
    );

    const handleEditTeam = () => {
        navigate(`/subject/${members.subjectId}/teams/${commandId}/edit`);
    };

    const handleAssignCaptainManually = (captainId: string) => {
        if (isFinalized) {
            setMessage('Команды уже финализированы. Изменение капитана недоступно.');
            return;
        }
        onTeamUpdate(members.id, (team) => {
            const teamCaptain = team.members.find((member) => member.userId === captainId) ?? null;
            return {
                ...team,
                captainId,
                captain: teamCaptain,
                captainSelectionMethod: 'Manual',
                captainVoting: null,
            };
        });
        setMessage('Капитан назначен вручную');
    };

    const handleCaptainVoting = () => {
        if (isFinalized) {
            setMessage('Команды уже финализированы. Голосование за капитана недоступно.');
            return;
        }
        if (config.captainVotingDeadline && Date.now() > Date.parse(config.captainVotingDeadline)) {
            setMessage('Срок голосования за капитана истек.');
            return;
        }
        if (members.members.length === 0) {
            return;
        }

        const votes = buildRandomVotes(members.members);
        const voting = resolveCaptainVoting(votes);

        onTeamUpdate(members.id, (team) => {
            const teamCaptain =
                team.members.find((member) => member.userId === voting.winnerId) ??
                team.captain ??
                null;
            return {
                ...team,
                captainId: voting.winnerId,
                captain: teamCaptain,
                captainSelectionMethod: 'Voting',
                captainVoting: voting,
            };
        });

        if (voting.tieResolvedByRandom) {
            setMessage(
                'Есть ничья в голосовании. Победитель выбран случайно и отмечен как капитан.',
            );
        } else {
            setMessage('Голосование завершено. Капитан выбран большинством голосов.');
        }
    };

    const handleFinalDecisionVoting = () => {
        if (isFinalized) {
            setMessage('Команды уже финализированы. Итоговое голосование недоступно.');
            return;
        }
        if (config.finalDecisionDeadline && Date.now() > Date.parse(config.finalDecisionDeadline)) {
            setMessage('Срок итогового решения истек.');
            return;
        }
        const threshold = config.finalDecisionThreshold ?? members.members.length;
        const approvals = members.members.reduce(
            (count) => (Math.random() > 0.5 ? count + 1 : count),
            0,
        );
        onTeamUpdate(members.id, (team) => ({
            ...team,
            finalDecision: {
                method: 'Voting',
                approvals,
                threshold,
                approved: approvals >= threshold,
                selectedBy: null,
                selectedAt: new Date().toISOString(),
            },
        }));
        setMessage('Итоговое решение зафиксировано голосованием команды.');
    };

    const handleFinalDecisionByCaptain = () => {
        if (isFinalized) {
            setMessage('Команды уже финализированы. Итоговое решение недоступно.');
            return;
        }
        if (config.finalDecisionDeadline && Date.now() > Date.parse(config.finalDecisionDeadline)) {
            setMessage('Срок итогового решения истек.');
            return;
        }
        if (!members.captainId) {
            setMessage('Нельзя принять решение капитаном, пока капитан не выбран.');
            return;
        }
        onTeamUpdate(members.id, (team) => ({
            ...team,
            finalDecision: {
                method: 'CaptainDecision',
                approvals: Math.max(config.finalDecisionThreshold ?? 1, 1),
                threshold: config.finalDecisionThreshold ?? 1,
                approved: true,
                selectedBy: members.captainId ?? null,
                selectedAt: new Date().toISOString(),
            },
        }));
        setMessage('Итоговое решение подтверждено капитаном.');
    };

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
            <div className='bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden'>
                <div className='px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0'>
                    <div>
                        <h3 className='text-xl font-bold text-slate-800'>
                            Участники команды {commandNumber + 1}
                        </h3>
                    </div>
                    <button
                        className='p-2 hover:bg-slate-100 rounded-full transition-colors'
                        onClick={onClose}
                    ></button>
                </div>
                <div className='flex-1 overflow-y-auto p-8 space-y-4'>
                    {errorMessage && (
                        <div className='mb-5 p-4 bg-red-100 rounded-2xl border border-red-100 flex flex-row items-center gap-4'>
                            ⚠️
                            <p className='font-medium text-lg text-red-700'>
                                {'Состав команды уже полный. Выберите другую'}
                            </p>
                        </div>
                    )}
                    {config.captainEnabled ? (
                        captain ? (
                            <div className='mb-5 p-4 bg-amber-100 rounded-2xl border border-amber-100 flex flex-row items-center gap-4'>
                                <Crown className='text-amber-700' size={18} />
                                <p className='font-medium text-lg text-amber-700'>
                                    Капитан: {captain.username}
                                </p>
                            </div>
                        ) : (
                            <div className='mb-5 p-4 bg-amber-100 rounded-2xl border border-amber-100 flex flex-row items-center gap-4'>
                                ⚠️
                                <p className='font-medium text-lg text-amber-700'>
                                    Капитан не выбран
                                </p>
                            </div>
                        )
                    ) : (
                        <div className='mb-5 p-4 bg-slate-100 rounded-2xl border border-slate-100 text-slate-600'>
                            Капитан отключен. Финальное решение принимается голосованием участников.
                        </div>
                    )}
                    {config.isFinalized && (
                        <div className='mb-5 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700 text-sm'>
                            Команда финализирована{' '}
                            {config.finalizedAt
                                ? `(${new Date(config.finalizedAt).toLocaleString('ru-RU')})`
                                : ''}
                            . Изменения отключены.
                        </div>
                    )}

                    {isTeacher && config.captainEnabled && (
                        <div className='rounded-2xl border border-slate-100 p-4 bg-slate-50'>
                            <p className='text-sm font-semibold text-slate-700 mb-3'>
                                Назначение капитана преподавателем
                            </p>
                            <div className='flex flex-wrap gap-2'>
                                {members.members.map((participant) => (
                                    <button
                                        key={participant.userId}
                                        type='button'
                                        onClick={() =>
                                            handleAssignCaptainManually(participant.userId)
                                        }
                                        disabled={isFinalized}
                                        className='px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        {participant.username}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {isTeacher && isCaptainVotingMode && (
                        <div className='rounded-2xl border border-purple-100 p-4 bg-purple-50'>
                            <p className='text-sm font-semibold text-purple-700 mb-2'>
                                Выбор капитана голосованием команды
                            </p>
                            <button
                                type='button'
                                onClick={handleCaptainVoting}
                                disabled={members.members.length === 0 || isFinalized}
                                className='px-4 py-2 rounded-xl bg-linear-to-r from-purple-600 to-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                Провести голосование
                            </button>
                            {config.captainVotingDeadline && (
                                <p className='mt-2 text-xs text-purple-700'>
                                    Дедлайн:{' '}
                                    {new Date(config.captainVotingDeadline).toLocaleString('ru-RU')}
                                </p>
                            )}
                            {members.captainVoting && (
                                <div className='mt-3 text-xs text-purple-700 whitespace-pre-line'>
                                    {Object.entries(members.captainVoting.votes)
                                        .map(([userId, votesCount]) => `${userId}: ${votesCount}`)
                                        .join('\n')}
                                    {members.captainVoting.tieResolvedByRandom &&
                                        `\nНичья: ${members.captainVoting.tieCandidates.join(', ')}. Победитель выбран случайно.`}
                                </div>
                            )}
                        </div>
                    )}
                    <div className='rounded-2xl border border-slate-100 p-4 bg-slate-50'>
                        <p className='text-sm font-semibold text-slate-700 mb-2'>
                            Итоговое решение команды
                        </p>
                        <p className='text-xs text-slate-500 mb-3'>
                            {config.captainEnabled
                                ? 'Метод: выбор капитаном'
                                : `Метод: голосование (порог ${config.finalDecisionThreshold})`}
                        </p>
                        {config.finalDecisionDeadline && (
                            <p className='text-xs text-slate-500 mb-3'>
                                Дедлайн:{' '}
                                {new Date(config.finalDecisionDeadline).toLocaleString('ru-RU')}
                            </p>
                        )}
                        {isTeacher && !config.captainEnabled && (
                            <button
                                type='button'
                                onClick={handleFinalDecisionVoting}
                                disabled={isFinalized}
                                className='px-4 py-2 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                Провести итоговое голосование
                            </button>
                        )}
                        {isTeacher && config.captainEnabled && (
                            <button
                                type='button'
                                onClick={handleFinalDecisionByCaptain}
                                disabled={isFinalized || !members.captainId}
                                className='px-4 py-2 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                Подтвердить решение капитаном
                            </button>
                        )}
                        {members.finalDecision && (
                            <p className='mt-3 text-xs text-slate-600'>
                                Статус: {members.finalDecision.approved ? 'принято' : 'не принято'}{' '}
                                • метод:{' '}
                                {members.finalDecision.method === 'CaptainDecision'
                                    ? 'капитан'
                                    : 'голосование'}{' '}
                                • голоса: {members.finalDecision.approvals}/
                                {members.finalDecision.threshold}
                            </p>
                        )}
                    </div>

                    {message && (
                        <div className='p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm'>
                            {message}
                        </div>
                    )}

                    <div className='space-y-3'>
                        {!members || members.members.length === 0 ? (
                            <div className='text-slate-400 text-center'>Нет участников</div>
                        ) : (
                            members.members.map((participant) => {
                                const isSelf = participant.userId === currentUserId;
                                const isCaptain = members.captainId === participant.userId;
                                return (
                                    <div
                                        key={participant.userId}
                                        className='flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all'
                                    >
                                        <div className='flex items-center gap-4'>
                                            <div className='w-11 h-11 bg-linear-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md shrink-0'>
                                                <UserIcon size={20} className='text-white' />
                                            </div>
                                            <div>
                                                <div className='flex items-center gap-2 flex-wrap'>
                                                    <p className='font-bold text-slate-800'>
                                                        {participant.username}
                                                        {isSelf && (
                                                            <span className='text-xs text-slate-400'>
                                                                (вы)
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {isCaptain && (
                                            <span className='px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1'>
                                                <Crown size={11} /> Капитан
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
                <div className='px-8 py-5 border-t border-slate-100 flex justify-start gap-4 bg-slate-50/50 shrink-0'>
                    <button
                        className='px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200 w-full'
                        onClick={onClose}
                    >
                        Закрыть
                    </button>
                    {members && members.members.length > 0 && role !== 'student' && (
                        <button
                            disabled={isFinalized}
                            className='bg-linear-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all w-full disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed'
                            onClick={handleEditTeam}
                        >
                            Изменить состав команды
                        </button>
                    )}
                    {couldViewJoinInterface && (
                        <>
                            {!isMember && (
                                <button
                                    disabled={isFinalized || isMemberOfAnyTeam}
                                    className='bg-linear-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all w-full disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed'
                                    onClick={handleJoinClick}
                                >
                                    Вступить в команду
                                </button>
                            )}
                            {isMember && (
                                <button
                                    disabled={isFinalized}
                                    className='bg-linear-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all w-full disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed'
                                    onClick={handleLeaveClick}
                                >
                                    Покинуть команду
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommandParticipantsModal;
