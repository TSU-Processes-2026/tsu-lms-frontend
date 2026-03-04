import { act, renderHook } from "@testing-library/react";
import { useRegisterForm } from "./useRegisterForm";
import { register } from "../../../api/register/register";
import { login } from "../../../api/authorization/login";
import {
  CONFIRM_PASSWORD_EMPTY_ERROR_MESSAGE,
  CONFIRM_PASSWORD_FAILED_ERROR_MESSAGE,
  LOGIN_EMPTY_ERROR_MESSAGE,
  LOGIN_LENGTH_ERROR_MESSAGE,
  PASSWORD_EMPTY_ERROR_MESSAGE,
  PASSWORD_LENGTH_ERROR_MESSAGE,
  UNIQUE_LOGIN_ERROR_MESSAGE,
} from "../../../constants/error/errorMessages";
import { AxiosResponse } from "axios";
import { TokenResponse } from "../../../types/token/TokenResponse";
import { UserResponse } from "../../../types/user/UserResponse";
import { HOME_PAGE_URL } from "../../../constants/paths/paths";

jest.mock("../../../api/register/register");
jest.mock("../../../api/authorization/login");
const mockRegister = register as jest.MockedFunction<typeof register>;
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

describe("useRegisterForm: Тесты валидации входных данных", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Поля формы должны инициализироваться пустыми значениями", () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setUsername("");
      result.current.setPassword("");
      result.current.setConfirmPassword("");
    });

    expect(result.current.username).toBe("");
    expect(result.current.password).toBe("");
    expect(result.current.confirmPassword).toBe("");
  });

  test("В поле ввода логина отображается введенное пользователем значение", () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setUsername("login");
    });

    expect(result.current.username).toBe("login");
  });

  test("В поле ввода пароля отображается введенное пользователем значение", () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setPassword("password123");
    });

    expect(result.current.password).toBe("password123");
  });

  test("В поле ввода подтверждения пароля отображается введенное пользователем значение", () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setConfirmPassword("confirm_password123");
    });

    expect(result.current.confirmPassword).toBe("confirm_password123");
  });
  //Валидация поля с логином
  test("При валидации логина с пустым значением возвращается ошибка", () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setUsername("");
      result.current.setPassword("password123");
      result.current.setConfirmPassword("password123");
      result.current.validateForm();
    });

    expect(result.current.errorMessage).toBe(LOGIN_EMPTY_ERROR_MESSAGE);
  });

  test("При валидации логина длиной менее 3 символов возвращается ошибка", () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setUsername("ло");
      result.current.setPassword("password123");
      result.current.setConfirmPassword("password123");
      result.current.validateForm();
    });

    expect(result.current.errorMessage).toBe(LOGIN_LENGTH_ERROR_MESSAGE);
  });

  test("При валидации логина длиной в 3 символа сообщение об ошибке отсутствует", () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setUsername("login");
      result.current.setPassword("password123");
      result.current.setConfirmPassword("password123");
      result.current.validateForm();
    });

    expect(result.current.errorMessage).not.toBe(LOGIN_LENGTH_ERROR_MESSAGE);
    expect(result.current.errorMessage).not.toBe(LOGIN_EMPTY_ERROR_MESSAGE);
    expect(result.current.errorMessage).toBe("");
  });

  test("При валидации логина длиной более 50 символов возвращается ошибка", () => {
    const { result } = renderHook(() => useRegisterForm());
    act(() => {
      result.current.setUsername(
        "loginloginloginloginloginloginloginloginloginloginloginloginloginloginloginloginloginloginloginloginloginloginloginloginloginloginloginlogin",
      );
      result.current.setPassword("password123");
      result.current.setConfirmPassword("password123");
      result.current.validateForm();
    });

    expect(result.current.errorMessage).not.toBe(LOGIN_LENGTH_ERROR_MESSAGE);
  });
  //Валидация поля с паролем
  test("При валидации пароля с пустым значением возвращается ошибка", () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setUsername("test");
      result.current.setPassword("");
      result.current.setConfirmPassword("password123");
      result.current.validateForm();
    });

    expect(result.current.errorMessage).toBe(PASSWORD_EMPTY_ERROR_MESSAGE);
  });

  test("При валидации пароля длиной менее 6 символов возвращается ошибка", () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setUsername("test");
      result.current.setPassword("passw");
      result.current.setConfirmPassword("password123");
      result.current.validateForm();
    });

    expect(result.current.errorMessage).toBe(PASSWORD_LENGTH_ERROR_MESSAGE);
  });

  test("При валидации пароля длиной 6 символов сообщение об ошибке отсутствует", () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setUsername("test");
      result.current.setPassword("123456");
      result.current.setConfirmPassword("password123");
      result.current.validateForm();
    });

    expect(result.current.errorMessage).toBe("");
  });

  test("При валидации пароля длиной более 20 символов возвращается ошибка", () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setPassword("123456123456123456123456123456");
      result.current.setUsername("test");
      result.current.setConfirmPassword("password123");
      result.current.validateForm();
    });

    expect(result.current.errorMessage).toBe(PASSWORD_LENGTH_ERROR_MESSAGE);
  });
  //Валидация поля с подтверждением пароля
  test("При валидации подтверждения пароля с пустым значением возвращается ошибка", () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setConfirmPassword("");
      result.current.setUsername("test");
      result.current.setPassword("password123");
      result.current.validateForm();
    });

    expect(result.current.errorMessage).toBe(
      CONFIRM_PASSWORD_EMPTY_ERROR_MESSAGE,
    );
  });

  test("При несовпадении значения подтверждения пароля со значением введенного пароля возвращается ошибка", () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setUsername("test");
      result.current.setPassword("password123");
      result.current.setConfirmPassword("password12345");
      result.current.validateForm();
    });

    expect(result.current.password).not.toBe(result.current.confirmPassword);
    expect(result.current.errorMessage).toBe(
      CONFIRM_PASSWORD_FAILED_ERROR_MESSAGE,
    );
  });

  test("При совпадении значения подтверждения пароля со значением введенного пароля сообщение об ошибке остуствует", () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setUsername("test");
      result.current.setPassword("password123");
      result.current.setConfirmPassword("password123");
      result.current.validateForm();
    });

    expect(result.current.password).toBe(result.current.confirmPassword);
    expect(result.current.errorMessage).toBe("");
  });
});

describe("useRegisterForm: Тесты для проверки полного сценария регистрации пользователя", () => {
  const mockUserResponse: UserResponse = {
    id: "mock-uuid",
    username: "test_user",
  };

  const mockTokenResponse: TokenResponse = {
    tokenType: "Bearer",
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    expiresIn: 900,
    refreshExpiresIn: 60480,
    userId: "mock-uuid",
    sessionId: "mock-session",
  };

  const mockAxiosRegisterResponse: Partial<AxiosResponse<UserResponse>> = {
    data: mockUserResponse,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {} as any,
  };

  const mockAxiosLoginResponse: Partial<AxiosResponse<TokenResponse>> = {
    data: mockTokenResponse,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {} as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("После успешной регистрации возвращается id и username нового пользователя", async () => {
    mockRegister.mockResolvedValueOnce(
      mockAxiosRegisterResponse as AxiosResponse<UserResponse>,
    );

    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setUsername("test_user");
      result.current.setPassword("password123");
      result.current.setConfirmPassword("password123");
    });

    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(mockRegister).toHaveBeenCalledWith({
      username: "test_user",
      password: "password123",
    });

    expect(mockRegister).toHaveBeenCalledTimes(1);
    expect(mockRegister).toHaveReturnedWith(mockAxiosRegisterResponse);
    expect(result.current.errorMessage).toBe("");
  });

  test("После успешной регистрации вызывается метод авторизации пользователя", async () => {
    mockRegister.mockResolvedValueOnce(
      mockAxiosRegisterResponse as AxiosResponse<UserResponse>,
    );

    mockedLogin.mockResolvedValueOnce(
      mockAxiosLoginResponse as AxiosResponse<TokenResponse>,
    );

    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setUsername("test_user");
      result.current.setPassword("password123");
      result.current.setConfirmPassword("password123");
    });

    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(mockRegister).toHaveBeenCalledTimes(1);
    expect(mockRegister).toHaveBeenCalledWith({
      username: "test_user",
      password: "password123",
    });

    expect(mockedLogin).toHaveBeenCalledTimes(1);
    expect(mockedLogin).toHaveBeenCalledWith({
      username: "test_user",
      password: "password123",
    });
  });

  test("После успешной регистрации и авторизации должны сохраняться данные: accessToken, refreshToken, sessionId, userId в localStroage", async () => {
    mockRegister.mockResolvedValueOnce(
      mockAxiosRegisterResponse as AxiosResponse<UserResponse>,
    );

    mockedLogin.mockResolvedValueOnce(
      mockAxiosLoginResponse as AxiosResponse<TokenResponse>,
    );

    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setUsername("test_user");
      result.current.setPassword("password123");
      result.current.setConfirmPassword("password123");
    });

    await act(async () => {
      await result.current.onSubmit(mockEvent);
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
  });

  test("После успешной регистрации и авторизации должна произойти переадресация на главную страницу приложения", async () => {
    mockRegister.mockResolvedValueOnce(
      mockAxiosRegisterResponse as AxiosResponse<UserResponse>,
    );

    mockedLogin.mockResolvedValueOnce(
      mockAxiosLoginResponse as AxiosResponse<TokenResponse>,
    );

    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setUsername("test_user");
      result.current.setPassword("password123");
      result.current.setConfirmPassword("password123");
    });

    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(mockRegister).toHaveBeenCalledTimes(1);
    expect(mockedLogin).toHaveBeenCalledTimes(1);
    expect(mockLocalStorage).toHaveBeenCalledTimes(4);
    expect(window.location.href).toBe(HOME_PAGE_URL);
  });

  test("Сценарий с 400 ошибкой: Должно сохраняться сообщение об ошибке", async () => {
    const errorResponse = {
      response: {
        status: 400,
      },
      isAxiosError: true,
    };
    mockRegister.mockRejectedValueOnce(errorResponse);
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setUsername("va");
      result.current.setPassword("pass123");
    });
    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(mockRegister).not.toHaveBeenCalled();
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    expect(result.current.errorMessage).not.toBe("");
  });

  test("Сценарий с 409 ошибкой: Должно сохраняться сообщение об ошибке", async () => {
    const errorResponse = {
      response: {
        status: 409,
      },
      isAxiosError: true,
    };
    mockRegister.mockRejectedValueOnce(errorResponse);
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setUsername("not_unique_test_user");
      result.current.setPassword("password123");
    });

    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(mockRegister).toHaveBeenCalledTimes(1);
    expect(mockRegister).toHaveBeenCalledWith({
      username: "not_unique_test_user",
      password: "password123",
    });
    expect(result.current.errorMessage).toBe(UNIQUE_LOGIN_ERROR_MESSAGE);
  });
});
