export interface CaptainsRequest {
    captainIds: string[];
}

export interface CaptainAssignmentResponse {
    teamId: string;
    captainUserId: string;
    selectionMethod: string;
    selectedAt: string;
}

export interface CaptainAssignment {
    captainUserId: string;
}

export interface CaptainVote {
    votedForUserId: string;
}

export interface CaptainVoteResponse {
    sessionCompleted: boolean;
    selectedCaptainId: string;
}

export interface CaptainVotingStatus {
    sessionId: string;
    teamId: string;
    startedAt: string | null;
    deadlineAt: string | null;
    isClosed: boolean;
    closedAt: string | null;
    winnerId: string | null;
    totalMembers: 0;
    votesCast: 0;
    hasCurrentUserVoted: boolean;
}
