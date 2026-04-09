import { DEV_URL, PROD_URL, MOCK_URL } from '@/constants/config/config';
import { CaptainsRequest } from '@/types/command/Captains';
import { CommandConfig, TeamConfig } from '@/types/command/CommandConfig';
import { DraftResponse } from '@/types/command/Draft';
import {
    ConfirmationResponse,
    DistributedTeam,
    Members,
    RandomDistributionResponse,
    Team,
    TeamCreationResponse,
    TeamRequest,
    TeamValidation,
    UnAssignedStudents,
    ValidationDetails,
} from '@/types/command/Team';
import { normalizeDistributionModeLegacy } from '@/utils/teamConfig';
import { AxiosResponse } from 'axios';
import { apiClient } from '../axios-client';

const BASE_URL = DEV_URL || PROD_URL || MOCK_URL;

export const saveConfigParams = async (
    subjectId: string,
    params: CommandConfig,
): Promise<AxiosResponse<TeamConfig>> => {
    try {
        const response: AxiosResponse<TeamConfig> = await apiClient.put(
            `${BASE_URL}/subjects/${subjectId}/teams/settings`,
            {
                ...params,
                distributionMode: normalizeDistributionModeLegacy(params.distributionMode),
            },
        );
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const fetchConfig = async (subjectId: string): Promise<AxiosResponse<TeamConfig>> => {
    try {
        const response: AxiosResponse<TeamConfig> = await apiClient.get<TeamConfig>(
            `${BASE_URL}/subjects/${subjectId}/teams/settings`,
        );
        return response;
    } catch (error) {
        throw error;
    }
};

export const fetchSubjectTeams = async (
    subjectId: string | undefined,
): Promise<AxiosResponse<Team[]>> => {
    try {
        const response: AxiosResponse<Team[]> = await apiClient.get<Team[]>(
            `${BASE_URL}/subjects/${subjectId}/teams`,
        );
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const createTeamManually = async (
    subjectId: string | undefined,
    members: Members,
): Promise<AxiosResponse<TeamCreationResponse>> => {
    try {
        const response: AxiosResponse<TeamCreationResponse> =
            await apiClient.post<TeamCreationResponse>(
                `${BASE_URL}/subjects/${subjectId}/teams`,
                members,
            );
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const updateTeamMembers = async (
    subjectId: string | undefined,
    teamId: string | undefined,
    members: Members,
): Promise<AxiosResponse<TeamCreationResponse>> => {
    try {
        const response: AxiosResponse<TeamCreationResponse> = await apiClient.put(
            `${BASE_URL}/subjects/${subjectId}/teams/${teamId}`,
            members,
        );
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const fetchUnassignedStudents = async (
    subjectId: string | undefined,
): Promise<UnAssignedStudents> => {
    try {
        const response: AxiosResponse<UnAssignedStudents> =
            await apiClient.post<UnAssignedStudents>(
                `${BASE_URL}/subjects/${subjectId}/teams/unassigned`,
            );
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const previewRandomTeamDistribution = async (
    subjectId: string | undefined,
): Promise<RandomDistributionResponse> => {
    try {
        const response: AxiosResponse<RandomDistributionResponse> =
            await apiClient.post<RandomDistributionResponse>(
                `${BASE_URL}/subjects/${subjectId}/teams/random`,
                null,
            );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const validateManualDistribution = async (
    subjectId: string | undefined,
    teams: TeamValidation,
): Promise<ValidationDetails> => {
    try {
        const response: AxiosResponse<ValidationDetails> = await apiClient.post<ValidationDetails>(
            `${BASE_URL}/subjects/${subjectId}/teams/validate`,
            teams,
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const distributeWithManual = async (
    subjectId: string | undefined,
    teams: TeamRequest,
): Promise<AxiosResponse<DistributedTeam>> => {
    try {
        const response: AxiosResponse<DistributedTeam> = await apiClient.post<DistributedTeam>(
            `${BASE_URL}/subjects/${subjectId}/teams/manual`,
            teams,
        );
        return response;
    } catch (error) {
        throw error;
    }
};

export const confirmTeamDistribution = async (
    subjectId: string | undefined,
): Promise<AxiosResponse<ConfirmationResponse>> => {
    try {
        const response: AxiosResponse<ConfirmationResponse> =
            await apiClient.post<ConfirmationResponse>(
                `${BASE_URL}/subjects/${subjectId}/teams/finalize`,
                null,
            );
        return response;
    } catch (error) {
        throw error;
    }
};

export const createDraft = async (
    subjectId: string | undefined,
    captains: CaptainsRequest,
): Promise<any> => {
    try {
        const response: AxiosResponse<ConfirmationResponse> =
            await apiClient.post<ConfirmationResponse>(
                `${BASE_URL}/subjects/${subjectId}/teams/draft/start`,
                captains,
            );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchSubjectTeamDraft = async (
    subjectId: string | undefined,
): Promise<DraftResponse> => {
    try {
        const response: AxiosResponse<DraftResponse> = await apiClient.get(
            `${BASE_URL}/subjects/${subjectId}/teams/draft/state`,
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};
