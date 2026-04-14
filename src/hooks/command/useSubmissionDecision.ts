import {
    approveSubmissionByCaptain,
    fetchSubmissionDecisionStatus,
    fetchSubmissionDecisionVotesStatus,
    initiateVoting,
    rejectSubmissionByCaptain,
    sendVote,
} from '@/api/decision/submissionDecision';
import {
    CaptainDecision,
    SubmissionDecisionInitResponse,
    SubmissionDecisionStatus,
    SubmissionDecisionVote,
    SubmissionDecisionVoteResponse,
    SubmissionDecisionVotesStatus,
} from '@/types/decision/SubmissionDecision';

import { useCallback, useEffect, useState } from 'react';
import { useErrorHandler } from '../error/useErrorHandler';

export const useCaptainDecision = (submissionId: string) => {
    const [decision, setDecision] = useState<CaptainDecision>({ comment: '' });
    const [decisionResult, setDecisionResult] = useState<SubmissionDecisionInitResponse | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { errorMessage, handleError, clearError } = useErrorHandler();

    const handleDecision = useCallback((selectedDecision: CaptainDecision) => {
        setDecision((prev) => ({ ...prev, ...selectedDecision }));
    }, []);

    const handleApproveSubmissionByCaptain = useCallback(async (selectedDecision?: CaptainDecision) => {
        setDecisionResult(null);
        setIsLoading(true);
        try {
            const payload = selectedDecision ?? decision;
            const res: SubmissionDecisionInitResponse = await approveSubmissionByCaptain(
                submissionId,
                payload,
            );
            setDecision(payload);
            setDecisionResult({ ...res });
            clearError();
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    }, [submissionId, decision]);

    const handleRejectSubmissionByCaptain = useCallback(async (selectedDecision?: CaptainDecision) => {
        setDecisionResult(null);
        setIsLoading(true);
        try {
            const payload = selectedDecision ?? decision;
            const res: SubmissionDecisionInitResponse = await rejectSubmissionByCaptain(
                submissionId,
                payload,
            );
            setDecision(payload);
            setDecisionResult({ ...res });
            clearError();
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    }, [submissionId, decision]);

    return {
        decision,
        decisionResult,
        errorMessage,
        isLoading,
        handleDecision,
        handleApproveSubmissionByCaptain,
        handleRejectSubmissionByCaptain,
    };
};

export const useTeamMembersDecision = (submissionId: string) => {
    const [initVotingResult, setInitVotingResult] = useState<SubmissionDecisionInitResponse | null>(
        null,
    );
    const [selectedVote, setVote] = useState<SubmissionDecisionVote>({ decision: '', comment: '' });
    const [userVoteResult, setVoteResult] = useState<SubmissionDecisionVoteResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { errorMessage, handleError, clearError } = useErrorHandler();

    const handleSelectVote = useCallback((vote: SubmissionDecisionVote) => {
        setVote((prev) => ({ ...prev, ...vote }));
    }, []);

    const handleInitVoting = async () => {
        setIsLoading(true);
        try {
            const res: SubmissionDecisionInitResponse = await initiateVoting(submissionId);
            setInitVotingResult({ ...res });
            clearError();
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVote = async (vote?: SubmissionDecisionVote) => {
        setIsLoading(true);
        try {
            const payload = vote ?? selectedVote;
            const res: SubmissionDecisionVoteResponse = await sendVote(submissionId, payload);
            setVote(payload);
            setVoteResult({ ...res });
            clearError();
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        initVotingResult,
        userVoteResult,
        isLoading,
        selectedVote,
        handleSelectVote,
        errorMessage,
        handleInitVoting,
        handleVote,
    };
};

export const useDecisionDetails = (submissionId: string) => {
    const [decisionStatus, setDecisionStatus] = useState<SubmissionDecisionStatus | null>(null);
    const [votes, setVotes] = useState<SubmissionDecisionVotesStatus | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { errorMessage, handleError, clearError } = useErrorHandler();

    const fetchDetails = async (): Promise<void> => {
        if (!submissionId) {
            setDecisionStatus(null);
            setVotes(null);
            return;
        }

        setIsLoading(true);
        clearError();

        const [statusRes, votesRes] = await Promise.allSettled([
            fetchSubmissionDecisionStatus(submissionId),
            fetchSubmissionDecisionVotesStatus(submissionId),
        ]);

        if (statusRes.status === 'fulfilled') {
            setDecisionStatus(statusRes.value);
        } else {
            console.error('Status fetch error:', statusRes.reason);
            handleError(statusRes.reason);
        }

        if (votesRes.status === 'fulfilled') {
            setVotes(votesRes.value);
        } else {
            console.error('Votes fetch error:', votesRes.reason);
            handleError(votesRes.reason);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            if (isMounted) await fetchDetails();
        };

        init();

        return () => {
            isMounted = false;
        };
    }, [submissionId]);

    return {
        decisionStatus,
        votes,
        errorMessage,
        isLoading,
        refetchDetails: fetchDetails,
    };
};
