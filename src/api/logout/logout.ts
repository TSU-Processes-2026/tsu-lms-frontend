import axios, { AxiosResponse } from 'axios';
import { DEV_URL, PROD_URL, MOCK_URL } from '../../constants/config/config';
import { UserResponse } from '../../types/user/UserResponse';
import { apiClient } from '../axios-client';

const BASE_URL = DEV_URL || PROD_URL || MOCK_URL;

export const logoutUser = async (refreshToken: string): Promise<AxiosResponse> => {
    try {
        const response = await apiClient.post<UserResponse>(`${BASE_URL}/auth/logout`, {
            refreshToken: refreshToken,
        });
        return response;
    } catch (error) {
        throw error;
    }
};
