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

export const useDecisionDetails = async (submissionId: string) => {
    const handleRetrieveStatus = async () => {};
    const handleRetrieveVotes = async () => {};

    return {
        handleRetrieveStatus,
        handleRetrieveVotes,
    };
};
