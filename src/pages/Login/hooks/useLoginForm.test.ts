import { act, renderHook } from "@testing-library/react";
import { useLoginForm } from "./useLoginForm";
import { AxiosResponse } from "axios";
import { TokenResponse } from "../../../types/token/TokenResponse";
import { login } from "../../../api/authorization/login";

jest.mock("../../../api/authorization/login");
const mockedLogin = login as jest.MockedFunction<typeof login>;

const mockLocalStorage = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

const mockEvent = {
  preventDefault: jest.fn(),
} as unknown as React.FormEvent;

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("useLoginForm: Тесты валидации входных данных", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Поля формы должны инициализироваться пустыми значениями", () => {
    const { result } = renderHook(() => useLoginForm());

    expect(result.current.username).toBe("");
    expect(result.current.password).toBe("");
  });

  test("В поле ввода логина отображается введенное пользователем значение", () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setUsername("testuser");
    });

    expect(result.current.username).not.toBe("");
    expect(result.current.username).toBe("testuser");
  });

  test("В поле ввода пароля отображается введенное пользователем значение", () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setPassword("password");
    });

    expect(result.current.password).not.toBe("");
    expect(result.current.password).toBe("password");
  });

  test("При валидации логина длиной менее 3 символов возвращается ошибка", async () => {
    const { result } = renderHook(() => useLoginForm());
    const errorMessage = "Длина логина должна быть не менее 3";

    act(() => {
      result.current.setUsername("ло");
    });

    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(result.current.errorMessage).toBe(errorMessage);
  });

  test("При валидации логина длиной в 3 символа сообщение об ошибке отсутствует", async () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setUsername("лог");
    });

    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(result.current.errorMessage).toBe("");
  });

  test("При валидации пароля длиной менее 6 символов возвращается ошибка", async () => {
    const { result } = renderHook(() => useLoginForm());
    const errorMessage = "Длина пароля должна быть от 6 до 20 символов";

    act(() => {
      result.current.setPassword("passw");
    });

    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(result.current.errorMessage).toBe(errorMessage);
  });

  test("При валидации пароля длиной более 20 символов возвращается ошибка", async () => {
    const { result } = renderHook(() => useLoginForm());
    const errorMessage = "Длина пароля должна быть от 6 до 20 символов";

    act(() => {
      result.current.setPassword("passwordpasswordpassword");
    });

    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(result.current.errorMessage).toBe(errorMessage);
  });

  test("При валидации пароля длиной 6 символов сообщение об ошибке отсутствует", async () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setPassword("passwo");
    });

    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(result.current.errorMessage).toBe("");
  });

  test("При валидации пароля длиной 20 символов сообщение об ошибке отсутствует", async () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setPassword("passwordpassword1234");
    });

    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(result.current.errorMessage).toBe("");
  });

  test("При валидации формы с валидными данными сообщение об ошибке отсутствует", async () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setUsername("testuser");
      result.current.setPassword("password123");
    });

    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(result.current.errorMessage).toBe("");
  });
});

describe("useLoginForm: Тесты для проверки полного сценария авторизации пользователя", () => {
  const mockTokenResponse: TokenResponse = {
    tokenType: "Bearer",
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    expiresIn: 900,
    refreshExpiresIn: 60480,
    userId: "123",
    sessionId: "mock-session",
  };

  const mockAxiosResponse: Partial<AxiosResponse<TokenResponse>> = {
    data: mockTokenResponse,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {} as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Успешный сценарий: после успешного запроса на сервер, данные сохраняются в localStorage", async () => {
    mockedLogin.mockResolvedValueOnce(
      mockAxiosResponse as AxiosResponse<TokenResponse>,
    );
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setUsername("testuser");
      result.current.setPassword("password123");
    });

    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(mockedLogin).toHaveBeenCalledWith({
      username: "testuser",
      password: "password123",
    });
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "accessToken",
      mockTokenResponse.accessToken,
    );
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "refreshToken",
      mockTokenResponse.refreshToken,
    );
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "userId",
      mockTokenResponse.userId,
    );
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "sessionId",
      mockTokenResponse.sessionId,
    );
    expect(result.current.errorMessage).toBe("");
  });

  test("Сценарий с 400 ошибкой", async () => {
    const errorResponse = {
      response: {
        status: 400,
        data: { message: "Неверные данные" },
      },
      isAxiosError: true,
    };

    mockedLogin.mockRejectedValueOnce(errorResponse);

    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setUsername("va");
      result.current.setPassword("pass123");
    });

    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(mockedLogin).toHaveBeenCalledWith({
      username: "va",
      password: "pass123",
    });

    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    expect(result.current.errorMessage).not.toBe("");
    expect(result.current.errorMessage).toBe("Неверные данные");
  });

  test("Сценарий с 401 ошибкой", async () => {
    mockedLogin.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { message: "Неверный пароль" },
      },
      isAxiosError: true,
    });

    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setUsername("validuser");
      result.current.setPassword("validpass123");
    });

    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(mockedLogin).toHaveBeenCalled();
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    expect(result.current.errorMessage).toBe("Неверный пароль");
  });

  test("Сценарий с 500 ошибкой", async () => {
    mockedLogin.mockRejectedValueOnce({
      response: {
        status: 500,
        data: { message: "Ошибка сервера" },
      },
      isAxiosError: true,
    });

    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setUsername("validuser");
      result.current.setPassword("validpass123");
    });

    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(mockedLogin).toHaveBeenCalled();
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    expect(result.current.errorMessage).toBe("Ошибка сервера");
  });
});
