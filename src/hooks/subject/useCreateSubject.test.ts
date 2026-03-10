import { act, renderHook } from '@testing-library/react';
import { useCreateSubject } from './useCreateSubject';
import { createSubject } from '@/api/subject/subject';
import { ErrorDetails } from '@/types/error/ErrorDetails';
import { CreateSubjectRequest, CreateSubjectResponse } from '@/types/subject/CreateSubject';
import { AxiosResponse } from 'axios';
import { LOGIN_PAGE_URL } from '@/constants/paths/paths';

const mockEvent = {
    preventDefault: jest.fn(),
} as unknown as React.FormEvent;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));
jest.mock('@/api/subject/subject');
const mockedCreateSubject = createSubject as jest.MockedFunction<typeof createSubject>;

describe('useCreateSubject: Тесты сценария создания предмета', () => {
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

    const mockErrorResponse: ErrorDetails = {
        type: 'error',
        title: 'Bad Request',
        status: 400,
        detail: 'Title is required',
    };

    const mockUnauthorizedResponse: ErrorDetails = {
        type: 'error',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication required',
    };

    const mockServerErrorResponse: ErrorDetails = {
        type: 'error',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Something went wrong',
    };

    const error400Response = {
        response: {
            status: 400,
            data: mockErrorResponse,
            headers: { 'content-type': 'application/json' },
        },
        isAxiosError: true,
    };

    const error401Response = {
        response: {
            status: 401,
            data: mockUnauthorizedResponse,
            headers: { 'content-type': 'application/json' },
        },
        isAxiosError: true,
    };

    const error500Response = {
        response: {
            status: 500,
            data: mockServerErrorResponse,
            headers: { 'content-type': 'application/json' },
        },
        isAxiosError: true,
    };

    const getMockedHook = () => {
        const { result } = renderHook(() => useCreateSubject());
        return result.current;
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Успешный сценарий создания предмета', async () => {
        mockedCreateSubject.mockResolvedValueOnce(mockAxiosSuccessResponse as AxiosResponse);
        const hook = getMockedHook();

        act(() => {
            hook.setTitle(validRequest.title);
            hook.setDescription(validRequest.description);
        });

        await act(async () => {
            await hook.handleSubmit(mockEvent);
        });

        expect(mockedCreateSubject).toHaveBeenCalledTimes(1);
        expect(mockedCreateSubject).toHaveBeenCalledWith(validRequest);
        expect(hook.setErrorMessage).not.toHaveBeenCalled();
        expect(hook.errorMessage).toBe('');
    });

    test('При ошибке со стороны клиента должно выводится сообщение об ошибке', async () => {
        mockedCreateSubject.mockRejectedValueOnce(error400Response);
        const hook = getMockedHook();

        act(() => {
            hook.setTitle(invalidRequest.title);
            hook.setDescription(invalidRequest.description);
        });

        await act(async () => {
            await hook.handleSubmit(mockEvent);
        });

        expect(mockedCreateSubject).not.toHaveBeenCalled();
        expect(hook.errorMessage).not.toBe('');
    });

    test('При попытке создать предмет неавторизованному пользователю, он должен быть перенаправлен на страницу авторизации', async () => {
        mockedCreateSubject.mockRejectedValueOnce(error401Response);
        const hook = getMockedHook();

        act(() => {
            hook.setTitle(validRequest.title);
            hook.setDescription(validRequest.description);
        });

        await act(async () => {
            await hook.handleSubmit(mockEvent);
        });

        expect(mockedCreateSubject).toHaveBeenCalledTimes(1);
        expect(mockedCreateSubject).toHaveBeenCalledWith(validRequest);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(hook.errorMessage).toBe(mockUnauthorizedResponse.detail);
        expect(mockNavigate).toHaveBeenCalledWith(LOGIN_PAGE_URL);
    });

    test('При ошибке со стороны сервера должно выводится сообщение об ошибке', async () => {
        mockedCreateSubject.mockRejectedValueOnce(error500Response);
        const hook = getMockedHook();

        act(() => {
            hook.setTitle(validRequest.title);
            hook.setDescription(validRequest.description);
        });

        await act(async () => {
            await hook.handleSubmit(mockEvent);
        });

        expect(mockedCreateSubject).toHaveBeenCalled();
        expect(mockedCreateSubject).toHaveBeenCalledWith(validRequest);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(hook.errorMessage).toBe(mockServerErrorResponse.detail);
    });
});
