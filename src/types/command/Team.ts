export interface Team {
    id: string;
    subjectId: string;
    memberIds: string[];
    members: TeamMember[];
    captainId?: string | null;
    name?: string | null;
    captain?: TeamMember | null;
    captainSelectionMethod?: 'Manual' | 'Voting' | null;
    captainVoting?: CaptainVotingSummary | null;
    finalDecision?: TeamFinalDecision | null;
    representativeId?: string | null;
}

export interface TeamResponse {
    teams: Team[];
    distributionMode: string;
    isFinalized: boolean;
}

export interface TeamRequest {
    teams: Members[];
}

export interface TeamValidation {
    teams: Members[];
}

export interface TeamMember {
    userId: string;
    username: string;
    isCaptain?: boolean;
}

export interface CaptainVotingSummary {
    votes: Record<string, number>;
    tieCandidates: string[];
    tieResolvedByRandom: boolean;
    winnerId: string | null;
    resolvedAt: string | null;
}

export interface TeamFinalDecision {
    method: 'Voting' | 'CaptainDecision';
    approvals: number;
    threshold: number;
    approved: boolean;
    selectedBy: string | null;
    selectedAt: string | null;
}

export interface TeamCreationResponse {
    teams: Team[];
    warnings: string[];
}

export interface UnAssignedStudents {
    subjectId: string;
    studentIds: string[];
    students: TeamMember[];
}

export interface Members {
    memberIds: string[];
}

export interface RandomDistributionResponse extends ValidationDetails {
    subjectId: string;
    teams: Members[];
    suggestedParameters: SuggestedParameters | null;
}

export interface ValidationDetails {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface DistributedTeam {
    teams: Team[];
    warnings: string[];
}

interface SuggestedParameters {
    suggestedTeamsCount: number;
    suggestedMinTeamSize: number;
    suggestedMaxTeamSize: number;
    suggestedFixedTeamSize: number;
    suggestedTeamSizes: number[];
}

export interface ConfirmationResponse {
    isFinalized: boolean;
    finalizedAt: string | null;
}

export interface JoinTeamResponse {
    teams: Team[];
    warnings: string[];
}

export interface LeaveTeamResponse extends JoinTeamResponse {}
