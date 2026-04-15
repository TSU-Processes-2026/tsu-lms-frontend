export interface SubmissionDecisionInitResponse {
    sessionId: string;
    submissionId: string;
    mode: 'Voting' | 'CaptainDecides' | string;
    requiredDecisionsCount: number;
    startedAt: string | null;
    deadlineAt: string | null;
    isClosed: boolean;
    closedAt: string | null;
    result: 'Approved' | 'Rejected' | 'Expired' | string | null;
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
    totalTeamMembers: number;
    requiredDecisionsCount: number;
    totalDecisions: number;
    approvalsCount: number;
    rejectionsCount: number;
    requiredDecisionsReached: boolean;
    isClosed: boolean;
    result: 'Approved' | 'Rejected' | 'Expired' | string | null;
}

export interface SubmissionDecisionVote {
    decision: 'Approve' | 'Reject' | '';
    comment: string | null;
}

export interface SubmissionDecisionVoteResponse {
    sessionCompleted: boolean;
    finalResult: 'Approved' | 'Rejected' | 'Expired' | string | null;
}

export interface CaptainDecision {
    comment: string;
}
