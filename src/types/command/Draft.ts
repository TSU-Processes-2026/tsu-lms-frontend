import { TeamMember } from './Team';

export interface DraftResponse {
    subjectId: string;
    isActive: boolean;
    isCompleted: boolean;
    currentCaptainId: string;
    currentRound: number;
    teams: DraftTeams[];
    availableStudents: TeamMember[];
}

export interface DraftTeams {
    id: string;
    subjectId: string;
    name: string | null;
    captainId: string | null;
    memberIds: string[];
    members: TeamMember[];
}
