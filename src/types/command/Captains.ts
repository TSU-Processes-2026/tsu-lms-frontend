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
