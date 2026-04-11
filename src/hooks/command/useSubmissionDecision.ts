import {
    fetchSubmissionDecisionStatus,
    fetchSubmissionDecisionVotesStatus,
} from '@/api/decision/submissionDecision';
import {
    SubmissionDecisionStatus,
    SubmissionDecisionVotesStatus,
} from '@/types/decision/SubmissionDecision';
import { isAxiosError } from 'axios';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useErrorHandler } from '../error/useErrorHandler';

export const useCaptainDecision = (submissionId: string) => {
    const handleApproveSubmissionByCaptain = async () => {};
    const handleRejectSubmissionByCaptain = async () => {};

    return {
        handleApproveSubmissionByCaptain,
        handleRejectSubmissionByCaptain,
    };
};

export const useTeamMembersDecision = (submissionId: string) => {
    const handleInitVoting = async () => {};
    const handleVote = async () => {};

    return {
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
