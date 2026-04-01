export interface Team {
    id: string;
    subjectId: string;
    memberIds: string[];
}

export interface TeamCreationResponse {
    teams: Team[];
    warnings: string[];
}

export interface UnAssignedStudents {
    subjectId: string;
    studentIds: string[];
}

interface Members {
    memberIds: string[];
}

export interface RandomDistributionResponse extends DistributedTeam, ValidationDetails {
    subjectId: string;
    suggestedParameters: SuggestedParameters;
}

export interface ValidationDetails {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface DistributedTeam {
    teams: Members[];
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
