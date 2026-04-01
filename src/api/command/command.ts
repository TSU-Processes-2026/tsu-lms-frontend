import { ACCESS_TOKEN } from '@/constants/auth/auth';
import { DEV_URL, PROD_URL, MOCK_URL } from '@/constants/config/config';
import { CommandConfig } from '@/types/command/CommandConfig';
import { CommandParticipant } from '@/types/command/CommandParticipant';
import axios, { AxiosResponse } from 'axios';

const BASE_URL = DEV_URL || PROD_URL || MOCK_URL;

export const saveConfigParams = async (
    subjectId: string,
    params: CommandConfig,
): Promise<AxiosResponse<any>> => {
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);
    try {
        const response: AxiosResponse<any> = await axios.put(
            `${BASE_URL}/subject/${subjectId}/teams/settings`,
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

export const fetchCommandParticipants = async (
    commandId: string,
): Promise<CommandParticipant[]> => {
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);
    console.log(commandId);
    try {
        const response: CommandParticipant[] = await axios.get(
            `${BASE_URL}/commands/${commandId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        );
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
};
