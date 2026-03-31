import { ACCESS_TOKEN } from '@/constants/auth/auth';
import { DEV_URL, PROD_URL, MOCK_URL } from '@/constants/config/config';
import { CommandConfig } from '@/types/command/CommandConfig';
import { UserResponse } from '@/types/user/UserResponse';
import axios, { AxiosResponse } from 'axios';

const BASE_URL = DEV_URL || PROD_URL || MOCK_URL;

export const saveConfigParams = async (params: CommandConfig): Promise<AxiosResponse<any>> => {
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);

    try {
        const response: AxiosResponse<UserResponse> = await axios.post(
            `${BASE_URL}/commands/config`,
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
