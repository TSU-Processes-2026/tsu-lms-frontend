import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Crown, LoaderCircle, Vote, XCircle } from 'lucide-react';
import { Assignment, Submission } from '@/types/assignments/assignments';
import { Team } from '@/types/command/Team';
import {
    useCaptainDecision,
    useDecisionDetails,
    useTeamMembersDecision,
} from '@/hooks/submissionDecision/useSubmissionDecision';
import { ACCESS_TOKEN } from '@/constants/auth/auth';
import { DEV_URL, MOCK_URL, PROD_URL } from '@/constants/config/config';
import { ApiSubmission, mapSubmission } from '@/utils/submissionMapper';
import { mapErrorMessage } from '@/utils/messageMapper';

interface TeamDecisionModalProps {
    assignment: Assignment;
    team: Team;
    currentUserId: string;
    onClose: () => void;
}

const API_BASE = DEV_URL || PROD_URL || MOCK_URL;

export const TeamDecisionModal: React.FC<TeamDecisionModalProps> = ({
    assignment,
    team,
    currentUserId,
    onClose,
}) => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>('');
    const [comment, setComment] = useState('');
    const [isLoadingSolutions, setIsLoadingSolutions] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const selectedSubmission = useMemo(
        () => submissions.find((submission) => submission.id === selectedSubmissionId) ?? null,
        [selectedSubmissionId, submissions],
    );
    const isCaptain = team.captainId === currentUserId;
    const finalDecisionSubmissionId = useMemo(
        () => submissions.find((submission) => submission.isFinalTeamDecision)?.id ?? null,
        [submissions],
    );
    const teamMemberIds = useMemo(
        () => new Set(team.members.map((member) => member.userId)),
        [team],
    );

    const {
        decisionStatus,
        votes,
        errorMessage: statusError,
        isLoading: isLoadingDecisionStatus,
        refetchDetails,
    } = useDecisionDetails(selectedSubmissionId);
    const {
        initVotingResult,
        userVoteResult,
        isLoading: isVotingActionLoading,
        errorMessage: voteError,
        handleInitVoting,
        handleVote,
    } = useTeamMembersDecision(selectedSubmissionId);
    const {
        decisionResult,
        isLoading: isCaptainActionLoading,
        errorMessage: captainError,
        handleApproveSubmissionByCaptain,
        handleRejectSubmissionByCaptain,
    } = useCaptainDecision(selectedSubmissionId);

    useEffect(() => {
        const loadTeamSubmissions = async () => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);

            if (!accessToken) {
                setLoadError('Требуется авторизация');
                setIsLoadingSolutions(false);
                return;
            }

            setIsLoadingSolutions(true);
            setLoadError(null);

            try {
                const response = await fetch(
                    `${API_BASE}/assignments/${assignment.id}/submissions?limit=100&offset=0&isTeacher=true`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    },
                );

                if (!response.ok) {
                    const payload = await response.json().catch(() => ({}));
                    throw new Error(payload.detail || `Ошибка ${response.status}`);
                }

                const payload = (await response.json()) as ApiSubmission[];
                const authorNameMap = new Map(
                    team.members.map((member) => [member.userId, member.username]),
                );
                const teamSubmissions = payload
                    .filter((submission) => teamMemberIds.has(submission.authorId))
                    .map((submission) =>
                        mapSubmission(submission, null, authorNameMap.get(submission.authorId)),
                    );

                setSubmissions(teamSubmissions);
                setSelectedSubmissionId((current) => current || teamSubmissions[0]?.id || '');
            } catch (error) {
                setLoadError((error as Error).message);
            } finally {
                setIsLoadingSolutions(false);
            }
        };

        loadTeamSubmissions();
    }, [assignment.id, team.members, teamMemberIds]);

    const handleInitiateDecision = async () => {
        await handleInitVoting();
        await refetchDetails();
        setMessage(
            decisionMode === 'CaptainDecides'
                ? 'Процедура выбора капитаном запущена.'
                : 'Процедура голосования запущена.',
        );
    };

    const handleVoteAction = async (decision: 'Approve' | 'Reject') => {
        await handleVote({
            decision,
            comment: comment.trim() ? comment.trim() : null,
        });
        await refetchDetails();
        setMessage(
            decision === 'Approve'
                ? 'Голос за решение отправлен.'
                : 'Голос против решения отправлен.',
        );
    };

    const handleCaptainAction = async (decision: 'Approve' | 'Reject') => {
        const payload = {
            comment: comment.trim(),
        };

        if (decision === 'Approve') {
            await handleApproveSubmissionByCaptain(payload);
        } else {
            await handleRejectSubmissionByCaptain(payload);
        }

        await refetchDetails();
        setMessage(
            decision === 'Approve' ? 'Капитан подтвердил решение.' : 'Капитан отклонил решение.',
        );
    };

    const activeError = loadError ?? voteError ?? captainError ?? statusError;
    const activeSession = decisionStatus ?? initVotingResult ?? decisionResult;
    const decisionMode = activeSession?.mode ?? (team.captainId ? 'CaptainDecides' : 'Voting');
    const isActionLoading =
        isLoadingSolutions ||
        isLoadingDecisionStatus ||
        isVotingActionLoading ||
        isCaptainActionLoading;
    const canInitiateDecision = Boolean(
        selectedSubmission &&
        selectedSubmission.status !== 'Graded' &&
        !activeSession &&
        (!finalDecisionSubmissionId || finalDecisionSubmissionId === selectedSubmission.id),
    );
    const canVote =
        decisionMode === 'Voting' &&
        Boolean(activeSession) &&
        !activeSession?.isClosed &&
        !decisionStatus?.hasCurrentUserDecided;
    const canCaptainDecide =
        decisionMode === 'CaptainDecides' &&
        isCaptain &&
        Boolean(activeSession) &&
        !activeSession?.isClosed;
    const selectedSubmissionDecisionSummary =
        selectedSubmission?.isFinalTeamDecision
            ? 'Это итоговое решение команды.'
            : selectedSubmission?.decisionResult
              ? `Результат выбора: ${selectedSubmission.decisionResult}`
              : null;

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-slate-900/60 backdrop-blur-sm' onClick={onClose} />
            <div className='bg-white w-full max-w-6xl max-h-[90vh] rounded-[2.5rem] shadow-2xl z-10 flex flex-col overflow-hidden'>
                <div className='px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 shrink-0'>
                    <div>
                        <h3 className='text-xl font-bold text-slate-800'>
                            Выбор итогового решения команды
                        </h3>
                        <p className='text-sm text-slate-500 mt-1'>
                            {assignment.content.split('\n')[0] || 'Задание'} •{' '}
                            {decisionMode === 'CaptainDecides'
                                ? 'решение подтверждает капитан'
                                : 'решение выбирается голосованием команды'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className='p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors'
                    >
                        <XCircle size={24} />
                    </button>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-0 flex-1 min-h-0'>
                    <div className='border-r border-slate-100 overflow-y-auto p-6 space-y-4'>
                        <div className='flex items-center justify-between'>
                            <h4 className='font-bold text-slate-800'>Решения команды</h4>
                            {isLoadingSolutions && (
                                <div className='flex items-center gap-2 text-sm text-slate-500'>
                                    <LoaderCircle size={16} className='animate-spin' />
                                    Загрузка
                                </div>
                            )}
                        </div>

                        {submissions.length === 0 && !isLoadingSolutions && (
                            <div className='p-6 rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 text-sm'>
                                У команды пока нет решений для выбора.
                            </div>
                        )}

                        {submissions.map((submission) => {
                            const isSelected = submission.id === selectedSubmissionId;
                            const isAuthor = submission.authorId === currentUserId;

                            return (
                                <button
                                    key={submission.id}
                                    type='button'
                                    onClick={() => {
                                        setSelectedSubmissionId(submission.id);
                                        setMessage(null);
                                        setComment('');
                                    }}
                                    className={`w-full text-left p-5 rounded-2xl border transition-all ${
                                        isSelected
                                            ? 'border-blue-400 bg-blue-50 shadow-sm'
                                            : 'border-slate-100 bg-white hover:border-slate-200'
                                    }`}
                                >
                                    <div className='flex items-start justify-between gap-4'>
                                        <div>
                                            <p className='font-bold text-slate-800'>
                                                {submission.authorName || submission.authorId}
                                                {isAuthor && (
                                                    <span className='text-xs text-slate-400 ml-2'>
                                                        (вы)
                                                    </span>
                                                )}
                                            </p>
                                            {submission.id === finalDecisionSubmissionId && (
                                                <p className='text-xs font-semibold text-blue-600 mt-1'>
                                                    Итоговое решение команды
                                                </p>
                                            )}
                                            <p className='text-sm text-slate-500 mt-1'>
                                                Статус: {submission.status}
                                            </p>
                                        </div>
                                        {team.captainId === submission.authorId && (
                                            <span className='px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center gap-1'>
                                                <Crown size={12} />
                                                Капитан
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className='overflow-y-auto p-6 space-y-4'>
                        <div className='rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2'>
                            <h4 className='font-bold text-slate-800'>Текущий статус</h4>
                            <p className='text-sm text-slate-600'>
                                Режим:{' '}
                                {decisionMode === 'CaptainDecides'
                                    ? 'Выбор капитаном'
                                    : 'Голосование'}
                            </p>
                            <p className='text-sm text-slate-600'>
                                Сессия:{' '}
                                {activeSession
                                    ? activeSession.isClosed
                                        ? 'завершена'
                                        : 'открыта'
                                    : 'не запущена'}
                            </p>
                            {decisionStatus && (
                                <>
                                    <p className='text-sm text-slate-600'>
                                        Голоса: {decisionStatus.decisionCast} из{' '}
                                        {decisionStatus.requiredDecisionsCount}
                                    </p>
                                    <p className='text-sm text-slate-600'>
                                        Итог: {decisionStatus.result ?? 'еще не определен'}
                                    </p>
                                </>
                            )}
                            {votes && (
                                <p className='text-sm text-slate-600'>
                                    За: {votes.approvalsCount} • Против: {votes.rejectionsCount}
                                </p>
                            )}
                        </div>

                        {selectedSubmission && (
                            <div className='rounded-2xl border border-slate-100 bg-white p-5 space-y-4'>
                                <div>
                                    <h4 className='font-bold text-slate-800'>
                                        Действие по решению
                                    </h4>
                                    <p className='text-sm text-slate-500 mt-1'>
                                        Автор:{' '}
                                        {selectedSubmission.authorName ||
                                            selectedSubmission.authorId}
                                    </p>
                                    {selectedSubmissionDecisionSummary && (
                                        <p className='text-sm text-blue-600 mt-1'>
                                            {selectedSubmissionDecisionSummary}
                                        </p>
                                    )}
                                </div>

                                <div className='space-y-4'>
                                    <h5 className='font-semibold text-slate-800'>
                                        Ответы участника команды
                                    </h5>
                                    {assignment.questions.map((question) => {
                                        const answer = selectedSubmission.answers?.[question.id];

                                        return (
                                            <div
                                                key={question.id}
                                                className='rounded-xl border border-slate-100 bg-slate-50 p-4'
                                            >
                                                <p className='font-semibold text-slate-800 mb-2'>
                                                    {question.questionData}
                                                </p>
                                                {question.questionType === 'SingleChoice' && (
                                                    <p className='text-sm text-slate-600'>
                                                        {question.options?.find(
                                                            (option) => option.id === answer,
                                                        )?.text ??
                                                            answer ??
                                                            '—'}
                                                    </p>
                                                )}
                                                {question.questionType === 'MultipleChoice' && (
                                                    <p className='text-sm text-slate-600'>
                                                        {(Array.isArray(answer) ? answer : [])
                                                            .map(
                                                                (id) =>
                                                                    question.options?.find(
                                                                        (option) =>
                                                                            option.id === id,
                                                                    )?.text,
                                                            )
                                                            .filter(Boolean)
                                                            .join(', ') || '—'}
                                                    </p>
                                                )}
                                                {question.questionType === 'Text' && (
                                                    <p className='text-sm text-slate-600 whitespace-pre-wrap'>
                                                        {answer || '—'}
                                                    </p>
                                                )}
                                                {question.questionType === 'File' && (
                                                    <p className='text-sm text-slate-600'>
                                                        {answer?.fileName || 'Файл загружен'}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <textarea
                                    value={comment}
                                    onChange={(event) => setComment(event.target.value)}
                                    rows={4}
                                    placeholder='Комментарий к решению'
                                    className='w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none'
                                />

                                {canInitiateDecision && (
                                    <button
                                        type='button'
                                        onClick={handleInitiateDecision}
                                        disabled={isActionLoading}
                                        className='w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all disabled:opacity-50'
                                    >
                                        {decisionMode === 'CaptainDecides'
                                            ? 'Запустить выбор капитаном'
                                            : 'Запустить голосование по выбранному решению'}
                                    </button>
                                )}

                                {canVote && (
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                        <button
                                            type='button'
                                            onClick={() => handleVoteAction('Approve')}
                                            disabled={isActionLoading}
                                            className='px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2'
                                        >
                                            <CheckCircle2 size={18} />
                                            Поддержать решение
                                        </button>
                                        <button
                                            type='button'
                                            onClick={() => handleVoteAction('Reject')}
                                            disabled={isActionLoading}
                                            className='px-4 py-3 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2'
                                        >
                                            <XCircle size={18} />
                                            Отклонить решение
                                        </button>
                                    </div>
                                )}

                                {canCaptainDecide && (
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                        <button
                                            type='button'
                                            onClick={() => handleCaptainAction('Approve')}
                                            disabled={isActionLoading}
                                            className='px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2'
                                        >
                                            <CheckCircle2 size={18} />
                                            Утвердить решение
                                        </button>
                                        <button
                                            type='button'
                                            onClick={() => handleCaptainAction('Reject')}
                                            disabled={isActionLoading}
                                            className='px-4 py-3 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2'
                                        >
                                            <XCircle size={18} />
                                            Отклонить решение
                                        </button>
                                    </div>
                                )}

                                {decisionMode === 'CaptainDecides' && !isCaptain && (
                                    <div className='p-4 rounded-xl border border-amber-100 bg-amber-50 text-amber-700 text-sm'>
                                        Решение может подтвердить только капитан команды.
                                    </div>
                                )}

                                {finalDecisionSubmissionId &&
                                    finalDecisionSubmissionId !== selectedSubmission.id && (
                                        <div className='p-4 rounded-xl border border-blue-100 bg-blue-50 text-blue-700 text-sm'>
                                            Итоговое решение уже выбрано для другой работы команды.
                                        </div>
                                    )}

                                {decisionMode === 'Voting' &&
                                    decisionStatus?.hasCurrentUserDecided && (
                                        <div className='p-4 rounded-xl border border-green-100 bg-green-50 text-green-700 text-sm'>
                                            Ваш голос по этому решению уже учтен.
                                        </div>
                                    )}
                            </div>
                        )}

                        {message && (
                            <div className='p-4 rounded-xl border border-green-100 bg-green-50 text-green-700 text-sm'>
                                {message}
                            </div>
                        )}

                        {activeError && (
                            <div className='p-4 rounded-xl border border-rose-100 bg-rose-50 text-rose-700 text-sm'>
                                {mapErrorMessage(activeError) ?? activeError}
                            </div>
                        )}

                        {(userVoteResult || decisionResult) && (
                            <div className='p-4 rounded-xl border border-blue-100 bg-blue-50 text-blue-700 text-sm flex items-center gap-2'>
                                <Vote size={16} />
                                Финальный результат:{' '}
                                {userVoteResult?.finalResult ??
                                    decisionResult?.result ??
                                    'ожидается'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
