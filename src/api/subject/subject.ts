import { ACCESS_TOKEN } from '@/constants/auth/auth';
import { DEV_URL, PROD_URL, MOCK_URL } from '@/constants/config/config';
import { CreateSubjectRequest, CreateSubjectResponse } from '@/types/subject/CreateSubject';
import axios, { AxiosResponse } from 'axios';

const BASE_URL = DEV_URL || PROD_URL || MOCK_URL;

export const createSubject = async (
    data: CreateSubjectRequest,
): Promise<AxiosResponse<CreateSubjectResponse>> => {
    try {
        const response = await axios.post(`${BASE_URL}/subjects`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
            },
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export const getSubjects = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/subjects?limit=100&offset=0`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
            },
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export const joinSubject = async (id: string) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/subjects/${id}/join`,
            {},
            {
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                },
            },
        );
        return response;
    } catch (error) {
        throw error;
    }
};
