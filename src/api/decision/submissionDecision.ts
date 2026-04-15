import {
    CaptainDecision,
    SubmissionDecisionInitResponse,
    SubmissionDecisionStatus,
    SubmissionDecisionVote,
    SubmissionDecisionVoteResponse,
    SubmissionDecisionVotesStatus,
} from '@/types/decision/SubmissionDecision';
import { AxiosResponse } from 'axios';
import { apiClient } from '../axios-client';

export const initiateVoting = async (
    submissionId: string,
): Promise<SubmissionDecisionInitResponse> => {
    try {
        const response: AxiosResponse<SubmissionDecisionInitResponse> =
            await apiClient.post<SubmissionDecisionInitResponse>(
                `/api/submissions/${submissionId}/decision/initiate`,
                null,
            );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const sendVote = async (
    submissionId: string,
    vote: SubmissionDecisionVote,
): Promise<SubmissionDecisionVoteResponse> => {
    try {
        const response: AxiosResponse<SubmissionDecisionVoteResponse> =
            await apiClient.post<SubmissionDecisionVoteResponse>(
                `/api/submissions/${submissionId}/decision/vote`,
                vote,
            );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchSubmissionDecisionStatus = async (
    submissionId: string,
): Promise<SubmissionDecisionStatus> => {
    console.log('id:', submissionId);
    try {
        const response: AxiosResponse<SubmissionDecisionStatus> =
            await apiClient.get<SubmissionDecisionStatus>(
                `/api/submissions/${submissionId}/decision/status`,
            );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchSubmissionDecisionVotesStatus = async (
    submissionId: string,
): Promise<SubmissionDecisionVotesStatus> => {
    try {
        const response: AxiosResponse<SubmissionDecisionVotesStatus> = await apiClient.get(
            `/api/submissions/${submissionId}/decision/votes`,
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const approveSubmissionByCaptain = async (
    submissionId: string,
    decision: CaptainDecision,
): Promise<SubmissionDecisionInitResponse> => {
    try {
        const response: AxiosResponse<SubmissionDecisionInitResponse> =
            await apiClient.post<SubmissionDecisionInitResponse>(
                `/api/submissions/${submissionId}/decision/captain-approve`,
                decision,
            );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const rejectSubmissionByCaptain = async (
    submissionId: string,
    decision: CaptainDecision,
): Promise<SubmissionDecisionInitResponse> => {
    try {
        const response: AxiosResponse<SubmissionDecisionInitResponse> =
            await apiClient.post<SubmissionDecisionInitResponse>(
                `/api/submissions/${submissionId}/decision/captain-reject`,
                decision,
            );
        return response.data;
    } catch (error) {
        throw error;
    }
};
