import { ConfirmationResponse } from './Team';

export interface CommandConfig {
    distributionMode: number;
    fixedTeamsCount: number;
    fixedTeamSize: number;
    minTeamSize: number;
    maxTeamSize: number;
}

export interface TeamConfig extends CommandConfig, ConfirmationResponse {
    subjectId: string;
    warnings: string[];
}
