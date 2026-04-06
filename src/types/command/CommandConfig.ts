import { ConfirmationResponse } from './Team';

export interface CommandConfig {
    distributionMode: number;
    fixedTeamsCount: number;
    fixedTeamSize: number | null;
    minTeamSize: number | null;
    maxTeamSize: number | null;
}

export interface TeamConfig extends CommandConfig, ConfirmationResponse {
    subjectId: string;
    warnings: string[];
}
