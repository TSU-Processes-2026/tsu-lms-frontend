import {
    approveSubmissionByCaptain,
    fetchSubmissionDecisionStatus,
    fetchSubmissionDecisionVotesStatus,
    rejectSubmissionByCaptain,
} from '@/api/decision/submissionDecision';
import {
    CaptainDecision,
    SubmissionDecisionInitResponse,
    SubmissionDecisionStatus,
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

    const handleApproveSubmissionByCaptain = useCallback(async () => {
        setDecisionResult(null);
        setIsLoading(true);
        try {
            const res: SubmissionDecisionInitResponse = await approveSubmissionByCaptain(
                submissionId,
                decision,
            );
            setDecisionResult({ ...res });
            clearError();
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    }, [submissionId, decision]);

    const handleRejectSubmissionByCaptain = useCallback(async () => {
        setDecisionResult(null);
        setIsLoading(true);
        try {
            const res: SubmissionDecisionInitResponse = await rejectSubmissionByCaptain(
                submissionId,
                decision,
            );
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
    const { errorMessage, handleError, clearError } = useErrorHandler();

    const handleInitVoting = async () => {};
    const handleVote = async () => {};

    return {
        errorMessage,
        handleInitVoting,
        handleVote,
    };
};

export const useDecisionDetails = (submissionId: string) => {
    const [decisionStatus, setDecisionStatus] = useState<SubmissionDecisionStatus | null>(null);
    const [votes, setVotes] = useState<SubmissionDecisionVotesStatus | null>(null);
    const [isDetailsLoading, setIsLoading] = useState<boolean>(false);

    const { errorMessage, handleError, clearError } = useErrorHandler();

    const fetchDetails = async (): Promise<void> => {
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
        isDetailsLoading,
    };
};
