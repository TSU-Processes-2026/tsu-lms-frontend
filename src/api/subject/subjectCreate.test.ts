import axios, { AxiosResponse } from 'axios';
import { createSubject } from './subject';
import { CreateSubjectRequest, CreateSubjectResponse } from '@/types/subject/CreateSubject';
import {
    error400Response,
    mockErrorResponse,
    error401Response,
    mockUnauthorizedResponse,
    error500Response,
    mockServerErrorResponse,
} from '@/constants/mocks/response';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('createSubject: Тесты запроса на сервер для создания предмета', () => {
    const validRequest: CreateSubjectRequest = {
        title: 'Математика',
        description: 'Введение в матанализ',
    };

    const invalidRequest: CreateSubjectRequest = {
        title: '',
        description: 'Описание',
    };

    const mockSuccessResponse: CreateSubjectResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Математика',
        description: 'Введение в математический анализ',
    };

    const mockAxiosSuccessResponse: Partial<AxiosResponse<CreateSubjectResponse>> = {
        data: mockSuccessResponse,
        status: 201,
        statusText: 'Created',
        headers: {
            'content-type': 'application/json',
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    (test('После успешного создания должен вернуться 201 статус и тело ответа', async () => {
        mockedAxios.post.mockResolvedValueOnce(mockAxiosSuccessResponse);

        const response = await createSubject(validRequest);

        expect(mockedAxios.post).toHaveBeenCalledTimes(1);

        expect(response).not.toBeNull();
        expect(response?.status).toBe(201);
        expect(response?.data).toEqual(mockSuccessResponse);
    }),
        test('После отправки невалидной формы должен вернуться ответ со статусом 400 и сообщением об ошибке', async () => {
            mockedAxios.post.mockRejectedValueOnce(error400Response);

            await expect(createSubject(invalidRequest)).rejects.toMatchObject({
                response: {
                    status: 400,
                    data: mockErrorResponse,
                },
            });

            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        }),
        test('При попытке создать предмет неавторизованным пользователем должен вернуться ответ со статусом 401 и сообщением об ошибке', async () => {
            mockedAxios.post.mockRejectedValueOnce(error401Response);

            await expect(createSubject(validRequest)).rejects.toMatchObject({
                response: {
                    status: 401,
                    data: mockUnauthorizedResponse,
                },
            });

            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        }),
        test('При ошибке на сервере должен вернуться ответ со статусом 500 и сообщением об ошибке', async () => {
            mockedAxios.post.mockRejectedValueOnce(error500Response);

            await expect(createSubject(validRequest)).rejects.toMatchObject({
                response: {
                    status: 500,
                    data: mockServerErrorResponse,
                },
            });

            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        }));
});
