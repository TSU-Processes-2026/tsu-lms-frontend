import axios, { type AxiosResponse } from 'axios';
import type { LoginRequest } from '../../types/auth/LoginRequest';
import type { TokenResponse } from '../../types/token/TokenResponse';
import { DEV_URL, PROD_URL, MOCK_URL } from '../../constants/config/config';
import { apiClient } from '../axios-client';

const BASE_URL = DEV_URL || PROD_URL || MOCK_URL;

export const login = async (data: LoginRequest): Promise<AxiosResponse<TokenResponse>> => {
    try {
        const response = await apiClient.post<TokenResponse>(`${BASE_URL}/auth/login`, data);
        return response;
    } catch (error) {
        throw error;
    }
};
