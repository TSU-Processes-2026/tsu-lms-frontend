import {
    CaptainAssignment,
    CaptainAssignmentResponse,
    CaptainVote,
    CaptainVoteResponse,
    CaptainVotingStatus,
} from '@/types/command/Captains';
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

//применяется в том случае, если в рез-те голосования у кандидатов равное число голосов,
//либо если при обязательном выборе капитана он не был указан при формированиии команды
export const assignCaptainByRandom = async (
    subjectId: string,
    teamId: string,
): Promise<CaptainAssignmentResponse> => {
    try {
        const response: AxiosResponse<CaptainAssignmentResponse> =
            await apiClient.post<CaptainAssignmentResponse>(
                `/subjects/${subjectId}/teams/${teamId}/captain/select-random`,
                null,
            );
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            console.log('Captain random assignment to team failed: ', error.response?.data);
        }
        throw error;
    }
};

//только если к команды создаются с капитанами
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

//только если назначен выбор голосованием
export const initCaptainVoting = async (
    subjectId: string,
    teamId: string,
): Promise<CaptainVotingStatus> => {
    try {
        const response: AxiosResponse<CaptainVotingStatus> =
            await apiClient.post<CaptainVotingStatus>(
                `/subjects/${subjectId}/teams/${teamId}/captain/initiate-voting`,
                null,
            );
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            console.log('Captain random assignment to team failed: ', error.response?.data);
        }
        throw error;
    }
};

//только при выборе капитана голосованием
export const sendVoteForCaptain = async (
    subjectId: string,
    teamId: string,
    voteFor: CaptainVote,
): Promise<CaptainVoteResponse> => {
    try {
        const res: AxiosResponse<CaptainVoteResponse> = await apiClient.post<CaptainVoteResponse>(
            `/subjects/${subjectId}/teams/${teamId}/captain/vote`,
            voteFor,
        );
        return res.data;
    } catch (error) {
        throw error;
    }
};

//получать только если выбрано назначение капитанов голосованием
export const fetchVotingStatus = async (
    subjectId: string,
    teamId: string,
): Promise<CaptainVotingStatus> => {
    try {
        const res: AxiosResponse<CaptainVotingStatus> = await apiClient.get<CaptainVotingStatus>(
            `/subjects/${subjectId}/teams/${teamId}/captain/voting-status`,
        );
        return res.data;
    } catch (error) {
        throw error;
    }
};
