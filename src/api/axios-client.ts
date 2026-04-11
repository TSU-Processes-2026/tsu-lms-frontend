import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/constants/auth/auth';
import { DEV_URL, PROD_URL, MOCK_URL } from '@/constants/config/config';
import { TokenResponse } from '@/types/token/TokenResponse';
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = DEV_URL || PROD_URL || MOCK_URL;
const PUBLIC_URI: string[] = ['/auth/login', '/auth/register', '/auth/refresh'];

export const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

//Промежуточный слой для запрососв
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const isPublicUri = PUBLIC_URI.some((uri) => config.url?.includes(uri));

        if (!isPublicUri) {
            const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN);
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else if (token) {
            promise.resolve(token);
        }
    });
    failedQueue = [];
};

const refreshAccessToken = async (): Promise<string> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);

    if (!refreshToken) {
        throw new Error('Вы не авторизованы');
    }

    try {
        const response: AxiosResponse<TokenResponse> = await axios.post<TokenResponse>(
            `${BASE_URL}/auth/refresh`,
            { refreshToken: refreshToken },
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem(ACCESS_TOKEN, accessToken);
        localStorage.setItem(REFRESH_TOKEN, newRefreshToken);

        return accessToken;
    } catch (error) {
        console.log('FAILED REFRESH');

        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        window.location.href = '/login';

        throw error;
    }
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (
            error.response?.status !== 401 ||
            PUBLIC_URI.some((url) => originalRequest.url?.includes(url))
        ) {
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            console.log('UNAUTH');

            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);
            window.location.href = '/login';

            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const newToken = await refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);

            return apiClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    },
);
