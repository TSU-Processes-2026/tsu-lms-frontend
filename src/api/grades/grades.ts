import { AxiosResponse } from 'axios';
import { apiClient } from '../axios-client';

export const fetchSubmissionGrade = async (submissionId: string): Promise<any> => {
    try {
        const res: AxiosResponse<any> = await apiClient.get<any>(
            `/submissions/${submissionId}/grade`,
        );
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const sendGradeToSubmission = async (submissionId: string): Promise<any> => {
    try {
        const res: AxiosResponse<any> = await apiClient.post<any>(
            `/submissions/${submissionId}/grade`,
            {},
        );
    } catch (error) {
        throw error;
    }
};
