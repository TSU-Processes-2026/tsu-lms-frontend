import { ConfirmationResponse } from './Team';

export type TeamDistributionMode = 'Manual' | 'Random' | 'Students' | 'Draft';
export type CaptainSelectionMethod = 'Manual' | 'Voting';
export type FinalDecisionMethod = 'Voting' | 'CaptainDecides';

export interface CommandConfig {
    distributionMode: TeamDistributionMode;
    fixedTeamsCount: number;
    fixedTeamSize: number | null;
    minTeamSize: number | null;
    maxTeamSize: number | null;
    requiresCaptain: boolean;
    captainSelectionMode: CaptainSelectionMethod;
    captainVotingDeadline: string | null;
    finalDecisionThreshold: number | null;
    decisionMode: FinalDecisionMethod;
    finalDecisionDeadline: string | null;
}

export interface TeamConfig extends CommandConfig, ConfirmationResponse {
    subjectId: string;
    warnings: string[];
}
