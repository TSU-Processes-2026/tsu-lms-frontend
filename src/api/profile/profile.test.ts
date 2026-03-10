import axios, { AxiosResponse } from 'axios';
import { getProfile } from './profile';
import { UserResponse } from '@/types/user/UserResponse';
import {
    error401Response,
    error500Response,
    mockServerErrorResponse,
    mockUnauthorizedResponse,
} from '@/constants/mocks/response';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('useProfile: Тесты запроса на сервер для получения профиля текущего пользователя', () => {
    const mockSuccessResponse: UserResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'username',
    };

    const mockAxiosSuccessResponse: Partial<AxiosResponse<UserResponse>> = {
        data: mockSuccessResponse,
        status: 200,
        statusText: 'OK',
        headers: {
            'content-type': 'application/json',
        },
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('После успешного запроса должен вернуться ответ со статусом 200 и телом ответа', async () => {
        mockedAxios.get.mockResolvedValueOnce(mockAxiosSuccessResponse as AxiosResponse);

        const response: AxiosResponse<UserResponse> = await getProfile();
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        expect(response.data.id).toBe(mockSuccessResponse.id);
        expect(response.data.username).toBe(mockSuccessResponse.username);
    });

    test('При попытке создать предмет неавторизованным пользователем должен вернуться ответ со статусом 401 и сообщением об ошибке', async () => {
        mockedAxios.get.mockRejectedValueOnce(error401Response);

        await expect(getProfile()).rejects.toMatchObject({
            response: {
                status: 401,
                data: mockUnauthorizedResponse,
            },
        });

        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    test('При ошибке на сервере должен вернуться ответ со статусом 500 и сообщением об ошибке', async () => {
        mockedAxios.get.mockRejectedValueOnce(error500Response);

        await expect(getProfile()).rejects.toMatchObject({
            response: {
                status: 500,
                data: mockServerErrorResponse,
            },
        });

        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
});
