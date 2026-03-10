import { getProfile } from '@/api/profile/profile';
import { useProfile } from './useProfile';
import { AxiosResponse } from 'axios';
import { UserResponse } from '@/types/user/UserResponse';
import { act, renderHook } from '@testing-library/react';
import { error401Response, error500Response } from '@/constants/mocks/response';
import { INTERNAL_SERVER_ERROR_PAGE_URL, LOGIN_PAGE_URL } from '@/constants/paths/paths';

jest.mock('@/api/profile/profile');
const mockedGetProfile = getProfile as jest.MockedFunction<typeof getProfile>;

const mockLocalStorage = {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

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

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
});

describe('useProfile: Тесты сценария получения профиля текущего пользователя', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('После успешного запроса должен вернуться 200 статус и тело ответа', async () => {
        mockedGetProfile.mockResolvedValueOnce(mockAxiosSuccessResponse as AxiosResponse);

        const { result } = renderHook(() => useProfile());

        await act(async () => {
            await result.current.getCurrentUser();
        });

        expect(mockedGetProfile).toHaveBeenCalled();
        expect(result.current.profile.id).not.toBe('');
        expect(result.current.profile.username).not.toBe('');
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('При попытке получить профиль не авторизованному пользователю, он должен быть перенаправлен на страницу авторизации', async () => {
        mockedGetProfile.mockRejectedValueOnce(error401Response);

        const { result } = renderHook(() => useProfile());

        await act(async () => {
            await result.current.getCurrentUser();
        });

        expect(mockedGetProfile).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(LOGIN_PAGE_URL);
    });

    test('При ошибке со стороны сервера пользователь должен быть перенаправлен на страницу 500 ошибки', async () => {
        mockedGetProfile.mockRejectedValueOnce(error500Response);

        const { result } = renderHook(() => useProfile());

        await act(async () => {
            await result.current.getCurrentUser();
        });

        expect(mockedGetProfile).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR_PAGE_URL);
    });
});
