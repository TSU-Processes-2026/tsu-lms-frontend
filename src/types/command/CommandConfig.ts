import { ConfirmationResponse } from './Team';

export type TeamDistributionMode = 'Manual' | 'Random' | 'Students' | 'Draft';
export type CaptainSelectionMethod = 'Manual' | 'Voting';
export type FinalDecisionMethod = 'Voting' | 'CaptainChoice';

export interface CommandConfig {
    distributionMode: TeamDistributionMode;
    fixedTeamsCount: number;
    fixedTeamSize: number | null;
    minTeamSize: number | null;
    maxTeamSize: number | null;
    captainEnabled: boolean;
    captainSelectionMethod: CaptainSelectionMethod;
    finalDecisionThreshold: number | null;
    decisionMethod: FinalDecisionMethod;
}

export interface TeamConfig extends CommandConfig, ConfirmationResponse {
    subjectId: string;
    warnings: string[];
}
