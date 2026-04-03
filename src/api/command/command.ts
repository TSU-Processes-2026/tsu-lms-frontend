import { ACCESS_TOKEN } from '@/constants/auth/auth';
import { DEV_URL, PROD_URL, MOCK_URL } from '@/constants/config/config';
import { CommandConfig, TeamConfig } from '@/types/command/CommandConfig';
import {
    ConfirmationResponse,
    DistributedTeam,
    Members,
    RandomDistributionResponse,
    Team,
    TeamCreationResponse,
    TeamRequest,
    UnAssignedStudents,
    ValidationDetails,
} from '@/types/command/Team';
import axios, { AxiosResponse } from 'axios';

const BASE_URL = DEV_URL || PROD_URL || MOCK_URL;

export const saveConfigParams = async (
    subjectId: string,
    params: CommandConfig,
): Promise<AxiosResponse<TeamConfig>> => {
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);
    try {
        const response: AxiosResponse<TeamConfig> = await axios.put(
            `${BASE_URL}/subjects/${subjectId}/teams/settings`,
            params,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        );
        return response;
    } catch (error) {
        throw error;
    }
};

export const fetchConfig = async (subjectId: string): Promise<AxiosResponse<TeamConfig>> => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    try {
        const response: AxiosResponse<TeamConfig> = await axios.get(
            `${BASE_URL}/subjects/${subjectId}/teams/settings`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        );
        return response;
    } catch (error) {
        throw error;
    }
};

export const fetchSubjectTeams = async (
    subjectId: string | undefined,
): Promise<AxiosResponse<Team[]>> => {
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);
    try {
        const response: AxiosResponse<Team[]> = await axios.get(
            `${BASE_URL}/subjects/${subjectId}/teams`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        );
        console.log(response);
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
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);
    try {
        const response: AxiosResponse<TeamCreationResponse> = await axios.post(
            `${BASE_URL}/subjects/${subjectId}/teams`,
            members,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
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
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);
    try {
        const response: AxiosResponse<TeamCreationResponse> = await axios.put(
            `${BASE_URL}/subjects/${subjectId}/teams/${teamId}`,
            members,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        );
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const fetchUnassignedStudents = async (
    subjectId: string | undefined,
): Promise<AxiosResponse<UnAssignedStudents>> => {
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);
    try {
        const response: AxiosResponse<UnAssignedStudents> = await axios.get(
            `${BASE_URL}/subjects/${subjectId}/teams/unassigned`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        );
        console.log(response.data);
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const previewRandomTeamDistribution = async (
    subjectId: string | undefined,
): Promise<AxiosResponse<RandomDistributionResponse>> => {
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);
    try {
        const response: AxiosResponse<RandomDistributionResponse> = await axios.post(
            `${BASE_URL}/subjects/${subjectId}/teams/random`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        );
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const validateManualDistribution = async (
    subjectId: string | undefined,
    teams: Members[],
): Promise<AxiosResponse<ValidationDetails>> => {
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);
    try {
        const response: AxiosResponse<ValidationDetails> = await axios.post(
            `${BASE_URL}/subjects/${subjectId}/teams/validate`,
            teams,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        );
        return response;
    } catch (error) {
        throw error;
    }
};

export const distributeWithManual = async (
    subjectId: string | undefined,
    teams: TeamRequest,
): Promise<AxiosResponse<DistributedTeam>> => {
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);
    try {
        const response: AxiosResponse<DistributedTeam> = await axios.post(
            `${BASE_URL}/subjects/${subjectId}/teams/manual`,
            teams,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        );
        return response;
    } catch (error) {
        throw error;
    }
};

export const confirmTeamDistribution = async (
    subjectId: string | undefined,
): Promise<AxiosResponse<ConfirmationResponse>> => {
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);
    try {
        const response: AxiosResponse<ConfirmationResponse> = await axios.post(
            `${BASE_URL}/subjects/${subjectId}/teams/finalize`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        );
        return response;
    } catch (error) {
        throw error;
    }
};
