import axios, { AxiosResponse } from "axios";
import { createSubject } from "./subject";
import { CreateSubjectRequest, CreateSubjectResponse } from "@/types/subject/CreateSubject";
import { ErrorDetails } from "@/types/error/ErrorDetails";

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("createSubject: Тесты запроса на сервер для создания предмета", () => {

    const validRequest: CreateSubjectRequest = {
        title: "Математика",
        description: "Введение в матанализ"
    };

    const invalidRequest: CreateSubjectRequest = {
        title: "",
        description: "Описание"
    };

    const mockSuccessResponse: CreateSubjectResponse = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        title: "Математика",
      description: "Введение в математический анализ"
    };

    const mockAxiosSuccessResponse: Partial<AxiosResponse<CreateSubjectResponse>> = {
        data: mockSuccessResponse,
        status: 201,
        statusText: "Created",
        headers: {
        'content-type': 'application/json',
        },
    };

    const mockErrorResponse: ErrorDetails = {
        type: "error",
        title: "Bad Request",
        status: 400,
        detail: "Title is required"
    };

    const mockUnauthorizedResponse: ErrorDetails = {
        type: "error",
        title: "Unauthorized",
        status: 401,
        detail: "Authentication required"
    };

    const mockServerErrorResponse: ErrorDetails = {
        type: "error",
        title: "Internal Server Error",
        status: 500,
        detail: "Something went wrong"
    };

    const error400Response = {
      response: {
        status: 400,
        data: mockErrorResponse,
        headers: { 'content-type': 'application/json' }
      },
      isAxiosError: true
    };

    const error401Response = {
      response: {
        status: 401,
        data: mockUnauthorizedResponse,
        headers: { 'content-type': 'application/json' }
      },
      isAxiosError: true
    };
    
    const error500Response = {
      response: {
        status: 500,
        data: mockServerErrorResponse,
        headers: { 'content-type': 'application/json' }
      },
      isAxiosError: true
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("После успешного создания должен вернуться 201 статус и тело ответа", async() => {
        mockedAxios.post.mockResolvedValueOnce(mockAxiosSuccessResponse);

        const response = await createSubject(validRequest);

        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        expect(mockedAxios.post).toHaveBeenCalledWith('/api/subjects', validRequest);

        expect(response).not.toBeNull();
        expect(response?.status).toBe(200);
        expect(response?.data).toEqual(mockSuccessResponse);

    }),

    test("После отправки невалидной формы должен вернуться ответ со статусом 400 и сообщением об ошибке", async () => {
        mockedAxios.post.mockRejectedValueOnce(error400Response);

        await expect(createSubject(invalidRequest)).rejects.toMatchObject({
            response: {
                status: 400,
                data: mockErrorResponse
            }
        });
    
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        expect(mockedAxios.post).toHaveBeenCalledWith('/api/subjects', invalidRequest);
    }),

    test("При попытке создать предмет неавторизованным пользователем должен вернуться ответ со статусом 401 и сообщением об ошибке", async () => {
        mockedAxios.post.mockRejectedValueOnce(error401Response);

        await expect(createSubject(validRequest)).rejects.toMatchObject({
            response: {
                status: 401,
                data: mockUnauthorizedResponse
            }
        });

        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        expect(mockedAxios.post).toHaveBeenCalledWith('/api/subjects', validRequest);
    }),

    test("При ошибке на сервере должен вернуться ответ со статусом 500 и сообщением об ошибке", async () => {
        mockedAxios.post.mockRejectedValueOnce(error500Response);

        await expect(createSubject(validRequest)).rejects.toMatchObject({
            response: {
                status: 500,
                data: mockServerErrorResponse
            }
        });

        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        expect(mockedAxios.post).toHaveBeenCalledWith('/api/subjects', validRequest);
    })
})