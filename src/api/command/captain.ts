import { CaptainAssignment, CaptainAssignmentResponse } from '@/types/command/Captains';
import { AxiosResponse, isAxiosError } from 'axios';
import { apiClient } from '../axios-client';

//только если в параметрах указано ручное назначение и нет капитана команды
export const assignCaptainManually = async (
    subjectId: string,
    teamId: string,
    assignment: CaptainAssignment,
): Promise<CaptainAssignmentResponse> => {
    try {
        const response: AxiosResponse<CaptainAssignmentResponse> =
            await apiClient.post<CaptainAssignmentResponse>(
                `/subjects/${subjectId}/teams/${teamId}/captain/assign`,
                assignment,
            );
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            console.log('Captain assignment to team failed: ', error.response?.data);
        }
        throw error;
    }
};

//применяется в том случае, если в рез-те голосования у кандидатов равное число голосов
export const assignCaptainByRandom = async (
    subjectId: string,
    teamId: string,
): Promise<CaptainAssignmentResponse> => {
    try {
        const response: AxiosResponse<CaptainAssignmentResponse> =
            await apiClient.post<CaptainAssignmentResponse>(
                `/subjects/${subjectId}/teams/${teamId}/captain/select-random`,
            );
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            console.log('Captain random assignment to team failed: ', error.response?.data);
        }
        throw error;
    }
};

export const fetchTeamCaptain = async (
    subjectId: string,
    teamId: string,
): Promise<CaptainAssignmentResponse> => {
    try {
        const response: AxiosResponse<CaptainAssignmentResponse> =
            await apiClient.get<CaptainAssignmentResponse>(
                `/subjects/${subjectId}/teams/${teamId}/captain`,
            );
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            console.log('Captain fetching failed: ', error.response?.data);
        }
        throw error;
    }
};

//для запуска голосования
export const initCaptainVoting = async (
    subjectId: string,
    teamId: string,
): Promise<CaptainAssignmentResponse> => {
    try {
        const response: AxiosResponse<CaptainAssignmentResponse> =
            await apiClient.post<CaptainAssignmentResponse>(
                `/subjects/${subjectId}/teams/${teamId}/captain/initiate-voting`,
            );
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            console.log('Captain random assignment to team failed: ', error.response?.data);
        }
        throw error;
    }
};
