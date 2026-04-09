import { DEV_URL, MOCK_URL, PROD_URL } from '@/constants/config/config';
import { UserResponse } from '@/types/user/UserResponse';
import { AxiosResponse } from 'axios';
import { apiClient } from '../axios-client';

const BASE_URL = DEV_URL || PROD_URL || MOCK_URL;

export const getProfile = async (): Promise<AxiosResponse<UserResponse>> => {
    try {
        const response: AxiosResponse<UserResponse> = await apiClient.get<UserResponse>(
            `${BASE_URL}/users/me`,
        );
        return response;
    } catch (error) {
        throw error;
    }
};
