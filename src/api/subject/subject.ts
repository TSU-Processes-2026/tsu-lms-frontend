import { DEV_URL, PROD_URL, MOCK_URL } from '@/constants/config/config';
import { CreateSubjectRequest, CreateSubjectResponse } from '@/types/subject/CreateSubject';
import { AxiosResponse } from 'axios';
import { apiClient } from '../axios-client';

const BASE_URL = DEV_URL || PROD_URL || MOCK_URL;

export const createSubject = async (
    data: CreateSubjectRequest,
): Promise<AxiosResponse<CreateSubjectResponse>> => {
    try {
        const response = await apiClient.post(`${BASE_URL}/subjects`, data);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getSubjects = async () => {
    try {
        const response = await apiClient.get(`${BASE_URL}/subjects?limit=100&offset=0`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const joinSubject = async (id: string) => {
    try {
        const response = await apiClient.post(`${BASE_URL}/subjects/${id}/join`, {});
        return response;
    } catch (error) {
        throw error;
    }
};
