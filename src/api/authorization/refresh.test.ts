import axios, { AxiosResponse } from "axios";
import { TokenResponse } from "../../types/token/TokenResponse";
import { refresh } from "./refresh";

import { SUCCESS_REFRESH_RESPONSE } from "../../constants/response/successMessages";
import {
  BAD_REQUEST,
  UNAUTHORIZED_TOKEN,
} from "../../constants/response/errorMessages";

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("refresh: Обвновление сессии пользователя(получение новой пары access и refresh токенов)", () => {
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
    statusText: SUCCESS_REFRESH_RESPONSE,
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

  test("Запрос должен быть выполнен успешно", async () => {
    mockAxios.post.mockResolvedValueOnce(mockAxiosSuccessResponse);
    const response = await refresh({ refreshToken: "refresh" });

    expect(response).not.toBeNull();
    expect(response?.status).toBe(200);
    expect(response?.data).toEqual(mockSuccessAuthResponse);

    expect(mockAxios.post).toHaveBeenCalledTimes(1);
  });
  test("Запрос должен быть выполнен со статусом 400", async () => {
    mockAxios.post.mockRejectedValueOnce(mockError400);

    await expect(refresh({ refreshToken: "refresh" })).rejects.toMatchObject(
      mockError400,
    );

    expect(mockAxios.post).toHaveBeenCalledTimes(1);
  });
  test("Запрос должен быть выполнен со статусом 401", async () => {
    mockAxios.post.mockRejectedValueOnce(mockError401);

    await expect(refresh({ refreshToken: "refresh" })).rejects.toMatchObject(
      mockError401,
    );

    expect(mockAxios.post).toHaveBeenCalledTimes(1);
  });
});
