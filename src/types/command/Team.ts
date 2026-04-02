export interface Team {
    id: string;
    subjectId: string;
    memberIds: string[];
    members: TeamMember[];
}

interface TeamMember {
    userId: string;
    username: string;
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
    suggestedParameters: SuggestedParameters;
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
    finalizedAt: string;
}
