export interface SubmissionDecisionInitResponse {
    sessionId: string;
    submissionId: string;
    mode: 'Manual' | 'Voting' | string;
    startedAt: string | null;
    deadlineAt: string | null;
    isClosed: boolean;
    closedAt: string | null;
    result: 'Approved' | 'Rejected' | string;
}

export interface SubmissionDecisionStatus extends SubmissionDecisionInitResponse {
    totalTeamMembers: number;
    decisionCast: number;
    approvalsCount: number;
    rejectionsCount: number;
    hasCurrentUserDecided: boolean;
}

export interface SubmissionDecisionVotesStatus {
    sessionId: string;
    submissionId: string;
    totalTeamMembers: 0;
    totalDecisions: 0;
    approvalsCount: 0;
    rejectionsCount: 0;
    majorityReached: boolean;
    isClosed: boolean;
    result: 'Approved' | 'Rejected' | string;
}

export interface SubmissionDecisionVote {
    decision: string;
    comment: string | null;
}

export interface SubmissionDecisionVoteResponse {
    sessionCompleted: boolean;
    finalResult: string;
}

export interface CaptainDecision {
    comment: string;
}
