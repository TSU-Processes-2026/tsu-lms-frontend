import { login } from "./login";
import type { LoginRequest } from "../../types/auth/LoginRequest";
import type { TokenResponse } from "../../types/token/TokenResponse";
import axios, { type AxiosResponse } from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Authorizaton tests", () => {
  const mockLoginDataForExistingUser: LoginRequest = {
    username: "ivanov_ivan1",
    password: "password123",
  };

  const mockLoginDataForExistingUserWithBadPassword: LoginRequest = {
    username: "ivanov_ivan1",
    password: "password123issik",
  };

  const mockLoginDataWithBadCredentials: LoginRequest = {
    username: "31",
    password: "passworkljdasjkdakdsl;asdklsald123",
  };

  const mockLoginDataWithEmptyValues: LoginRequest = {
    username: "",
    password: "",
  };

  const mockSuccessAuthResponse: TokenResponse = {
    tokenType: "Bearer",
    accessToken: "mock-access-token-123",
    refreshToken: "mock-refresh-token-123",
    expiresIn: 900,
    refreshExpiresIn: 60480,
    userId: "123",
    sessionId: "mock-session-123",
  };

  const mockAxiosSuccessResponse: Partial<AxiosResponse<TokenResponse>> = {
    data: mockSuccessAuthResponse,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {} as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("После успешной авторизации должен вернуться 200 статус и тело ответа", async () => {
    mockedAxios.post.mockResolvedValueOnce(mockAxiosSuccessResponse);

    const response = await login(mockLoginDataForExistingUser);

    expect(response).not.toBeNull();
    expect(response?.status).toBe(200);
    expect(response?.data).toEqual(mockSuccessAuthResponse);

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  test("После отправки невалидной формы должен вернуться ответ со статусом 400 и сообщением об ошибке", async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { message: "Неверные данные" },
      },
      isAxiosError: true,
    });

    await expect(login(mockLoginDataWithBadCredentials)).rejects.toMatchObject({
      response: {
        status: 400,
        data: { message: "Неверные данные" },
      },
    });

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  test("После отправки формы с пустыми полями должен вернуться ответ со статусом 400 и сообщением об ошибке", async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { message: "Неверные данные" },
      },
      isAxiosError: true,
    });

    await expect(login(mockLoginDataWithEmptyValues)).rejects.toMatchObject({
      response: {
        status: 400,
        data: { message: "Неверные данные" },
      },
    });

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  test("При неуспешной попытке авторизоваться должен вернуться ответ со статусом 401 и сообщением об ошибке", async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { message: "Неверный пароль" },
      },
      isAxiosError: true,
    });

    await expect(
      login(mockLoginDataForExistingUserWithBadPassword),
    ).rejects.toMatchObject({
      response: {
        status: 401,
        data: { message: "Неверный пароль" },
      },
    });

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });
});
