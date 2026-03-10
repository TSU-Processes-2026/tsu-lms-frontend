import { ACCESS_TOKEN } from '@/constants/auth/auth';
import { DEV_URL, MOCK_URL, PROD_URL } from '@/constants/config/config';
import { UserResponse } from '@/types/user/UserResponse';
import axios, { AxiosResponse } from 'axios';

const BASE_URL = DEV_URL || PROD_URL || MOCK_URL;

export const getProfile = async (): Promise<AxiosResponse<UserResponse>> => {
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);

    try {
        const response: AxiosResponse<UserResponse> = await axios.get(`${BASE_URL}/users/me`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response;
    } catch (error) {
        throw error;
    }
};
