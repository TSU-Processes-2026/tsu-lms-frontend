import { AxiosResponse } from "axios";
import { logout } from "../../api/logout/logout";
import { useLogout } from "./useLogout";
import {
  BAD_REQUEST,
  UNAUTHORIZED_TOKEN,
} from "../../constants/response/errorMessages";
import { act, renderHook } from "@testing-library/react";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants/auth/auth";
import { ROOT_URL } from "../../constants/paths/paths";
jest.mock("../../api/logout/logout");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockLogout = logout as jest.MockedFunction<typeof logout>;

const mockLocalStorage = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("useLogout: Тесты завершения активной сессии пользователя", () => {
  const mockAxiosLogoutResponse: Partial<AxiosResponse> = {
    status: 200,
    statusText: "Успешный выход (текущая сессия завершена)",
    headers: {},
    config: {} as any,
  };

  const mockError400 = {
    response: {
      status: 400,
      data: { message: BAD_REQUEST },
    },
    isAxiosError: true,
  };

  const mockError401 = {
    response: {
      status: 401,
      data: { message: UNAUTHORIZED_TOKEN },
    },
    isAxiosError: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const getMockedHook = () => {
    const { result } = renderHook(() => useLogout());
    return result.current;
  };

  test("При успешной обработке запроса к серверу, должны очищаться данные из localStorage", () => {
    mockLogout.mockResolvedValueOnce(mockAxiosLogoutResponse as AxiosResponse);
    mockLocalStorage.getItem
      .mockReturnValueOnce("mock-accessToken")
      .mockReturnValueOnce("mock-refreshToken");
    const mockLogoutHook = getMockedHook();

    act(() => {
      mockLogoutHook.logout();
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(ACCESS_TOKEN);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(REFRESH_TOKEN);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2);

    const token = localStorage.getItem(ACCESS_TOKEN);
    const refresh = localStorage.getItem(REFRESH_TOKEN);

    expect(token).toBeUndefined();
    expect(refresh).toBeUndefined();
  });

  test("При 400 ошибке, должны очищаться данные из localStorage", () => {
    mockLogout.mockRejectedValueOnce(mockError400);
    mockLocalStorage.getItem
      .mockReturnValueOnce("mock-accessToken")
      .mockReturnValueOnce("mock-refreshToken");
    const mockLogoutHook = getMockedHook();

    act(() => {
      mockLogoutHook.logout();
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(ACCESS_TOKEN);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(REFRESH_TOKEN);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2);

    const token = localStorage.getItem(ACCESS_TOKEN);
    const refresh = localStorage.getItem(REFRESH_TOKEN);

    expect(token).toBeUndefined();
    expect(refresh).toBeUndefined();
  });
  test("При 401 ошибке, должны очищаться данные из localStorage", () => {
    mockLogout.mockRejectedValueOnce(mockError401);
    mockLocalStorage.getItem
      .mockReturnValueOnce("mock-accessToken")
      .mockReturnValueOnce("mock-refreshToken");
    const mockLogoutHook = getMockedHook();

    act(() => {
      mockLogoutHook.logout();
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(ACCESS_TOKEN);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(REFRESH_TOKEN);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2);

    const token = localStorage.getItem(ACCESS_TOKEN);
    const refresh = localStorage.getItem(REFRESH_TOKEN);

    expect(token).toBeUndefined();
    expect(refresh).toBeUndefined();
  });

  test("При успешном завершении сессии пользователь должен быть перенаправлен на главную страницу", () => {
    mockLogout.mockResolvedValueOnce(mockAxiosLogoutResponse as AxiosResponse);
    const mockLogoutHook = getMockedHook();

    act(() => {
      mockLogoutHook.logout();
    });

    expect(mockNavigate).toHaveBeenCalledWith(ROOT_URL);
  });

  test("При завершении сессии с ошибкой от сервера пользователь должен быть перенаправлен на главную страницу", () => {
    mockLogout.mockRejectedValueOnce(mockError400);
    const mockLogoutHook = getMockedHook();

    act(() => {
      mockLogoutHook.logout();
    });

    expect(mockNavigate).toHaveBeenCalledWith(ROOT_URL);
  });
});
