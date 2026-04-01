import { ACCESS_TOKEN } from '@/constants/auth/auth';
import { DEV_URL, PROD_URL, MOCK_URL } from '@/constants/config/config';
import { CommandConfig } from '@/types/command/CommandConfig';
import { CommandParticipant } from '@/types/command/CommandParticipant';
import {
    ConfirmationResponse,
    DistributedTeam,
    RandomDistributionResponse,
    Team,
    TeamCreationResponse,
    UnAssignedStudents,
} from '@/types/command/Team';
import axios, { AxiosResponse } from 'axios';

const BASE_URL = DEV_URL || PROD_URL || MOCK_URL;

export const saveConfigParams = async (
    subjectId: string,
    params: CommandConfig,
): Promise<AxiosResponse<any>> => {
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);
    try {
        const response: AxiosResponse<any> = await axios.put(
            `${BASE_URL}/subject/${subjectId}/teams/settings`,
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

export const fetchCommandParticipants = async (
    commandId: string,
): Promise<CommandParticipant[]> => {
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);
    console.log(commandId);
    try {
        const response: CommandParticipant[] = await axios.get(
            `${BASE_URL}/commands/${commandId}`,
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

export const fetchSubjectTeams = async (subjectId: string): Promise<AxiosResponse<Team>> => {
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);
    try {
        const response: AxiosResponse<Team> = await axios.get(
            `${BASE_URL}/subject/${subjectId}/teams`,
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

export const createTeamManually = async (
    subjectId: string,
    members: string[],
): Promise<AxiosResponse<TeamCreationResponse>> => {
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);
    try {
        const response: AxiosResponse<TeamCreationResponse> = await axios.post(
            `${BASE_URL}/subject/${subjectId}/teams`,
            members,
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

export const updateTeamMembers = async (
    subjectId: string,
    teamId: string,
    members: string[],
): Promise<AxiosResponse<TeamCreationResponse>> => {
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);
    try {
        const response: AxiosResponse<TeamCreationResponse> = await axios.put(
            `${BASE_URL}/subject/${subjectId}/teams/${teamId}`,
            members,
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

export const fetchUnassignedStudents = async (
    subjectId: string,
): Promise<AxiosResponse<UnAssignedStudents>> => {
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);
    try {
        const response: AxiosResponse<UnAssignedStudents> = await axios.get(
            `${BASE_URL}/subject/${subjectId}/teams/unassigned`,
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

export const previewRandomTeamDistribution = async (
    subjectId: string,
): Promise<AxiosResponse<RandomDistributionResponse>> => {
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);
    try {
        const response: AxiosResponse<RandomDistributionResponse> = await axios.post(
            `${BASE_URL}/subject/${subjectId}/teams/random`,
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

export const validateManualDistribution = async (
    subjectId: string,
): Promise<AxiosResponse<DistributedTeam>> => {
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);
    try {
        const response: AxiosResponse<DistributedTeam> = await axios.post(
            `${BASE_URL}/subject/${subjectId}/teams/validate`,
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
    subjectId: string,
): Promise<AxiosResponse<DistributedTeam>> => {
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);
    try {
        const response: AxiosResponse<DistributedTeam> = await axios.post(
            `${BASE_URL}/subject/${subjectId}/teams/manual`,
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
    subjectId: string,
): Promise<AxiosResponse<ConfirmationResponse>> => {
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);
    try {
        const response: AxiosResponse<ConfirmationResponse> = await axios.post(
            `${BASE_URL}/subject/${subjectId}/teams/finalize`,
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
