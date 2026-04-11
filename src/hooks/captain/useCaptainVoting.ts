import {
    CaptainAssignmentResponse,
    CaptainVoteResponse,
    CaptainVotingStatus,
} from '@/types/command/Captains';
import { useCallback, useEffect, useState } from 'react';
import { useErrorHandler } from '../error/useErrorHandler';
import {
    assignCaptainByRandom,
    assignCaptainManually,
    fetchTeamCaptain,
    fetchVotingStatus,
    initCaptainVoting,
    sendVoteForCaptain,
} from '@/api/command/captain';

export const useFetchTeamCaptain = (
    subjectId: string,
    teamId: string,
    isCaptainEnabled: boolean,
) => {
    const [assignedCaptain, setCaptain] = useState<CaptainAssignmentResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { errorMessage, handleError, clearError } = useErrorHandler();

    const handleFetchCaptain = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const res: CaptainAssignmentResponse = await fetchTeamCaptain(subjectId, teamId);
            setCaptain({ ...res });
            clearError();
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            if (isMounted && isCaptainEnabled) await handleFetchCaptain();
        };
        init();

        return () => {
            isMounted = false;
        };
    }, [subjectId, teamId]);

    return {
        assignedCaptain,
        isLoading,
        errorMessage,
    };
};

export const useFetchCaptainVotingStatus = (
    subjectId: string,
    teamId: string,
    isCaptainEnabled: boolean,
) => {
    const [votingStatus, setVotingStatus] = useState<CaptainVotingStatus | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { errorMessage, handleError, clearError } = useErrorHandler();

    const handleFetchCaptainVotingStatus = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const res: CaptainVotingStatus = await fetchVotingStatus(subjectId, teamId);
            setVotingStatus({ ...res });
            clearError();
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            if (isMounted && isCaptainEnabled) await handleFetchCaptainVotingStatus();
        };
        init();

        return () => {
            isMounted = false;
        };
    }, [subjectId, teamId]);

    return {
        votingStatus,
        isLoading,
        errorMessage,
    };
};

export const useAssignCaptain = (subjectId: string, teamId: string) => {
    const [selectedId, setId] = useState<string>('');
    const [assignedCaptainResponse, setCaptainResponse] =
        useState<CaptainAssignmentResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { errorMessage, handleError, clearError } = useErrorHandler();

    const handleSelectCaptainId = useCallback((id: string) => {
        setId(id);
    }, []);

    const handleAssignManually = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const res: CaptainAssignmentResponse = await assignCaptainManually(subjectId, teamId, {
                captainUserId: selectedId,
            });
            setCaptainResponse({ ...res });
            clearError();
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssignByRandom = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const res: CaptainAssignmentResponse = await assignCaptainByRandom(subjectId, teamId);
            setCaptainResponse({ ...res });
            clearError();
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        selectedId,
        assignedCaptainResponse,
        isLoading,
        errorMessage,
        handleSelectCaptainId,
        handleAssignManually,
        handleAssignByRandom,
    };
};

export const useVoteForCaptain = (
    subjectId: string,
    teamId: string,
    hasVotingStatus: boolean,
    hasVoted: boolean,
) => {
    const [voteResponse, setVoteResponse] = useState<CaptainVoteResponse | null>(null);
    const [initVotingResponse, setInitVoting] = useState<CaptainVotingStatus | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { errorMessage, handleError, clearError } = useErrorHandler();

    const handleVoteForCaptain = async (voteFor: string): Promise<void> => {
        if (hasVoted) return;

        setIsLoading(true);
        try {
            const res: CaptainVoteResponse = await sendVoteForCaptain(subjectId, teamId, {
                votedForUserId: voteFor,
            });
            clearError();
            setVoteResponse({ ...res });
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInitiateVoting = async (): Promise<void> => {
        if (hasVotingStatus) return;

        setIsLoading(true);
        try {
            const res: CaptainVotingStatus = await initCaptainVoting(subjectId, teamId);
            setInitVoting({ ...res });
            clearError();
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        voteResponse,
        initVotingResponse,
        errorMessage,
        isLoading,
        handleVoteForCaptain,
        handleInitiateVoting,
    };
};
