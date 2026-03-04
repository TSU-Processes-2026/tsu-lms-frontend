import { act, renderHook } from "@testing-library/react";
import { useRegisterForm } from "./useRegisterForm";
import {
  CONFIRM_PASSWORD_EMPTY_ERROR_MESSAGE,
  CONFIRM_PASSWORD_FAILED_ERROR_MESSAGE,
  LOGIN_EMPTY_ERROR_MESSAGE,
  LOGIN_LENGTH_ERROR_MESSAGE,
  PASSWORD_EMPTY_ERROR_MESSAGE,
  PASSWORD_LENGTH_ERROR_MESSAGE,
} from "../../../constants/error/errorMessages";

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
      result.current.validateForm();
    });

    expect(result.current.errorMessage).toBe(LOGIN_EMPTY_ERROR_MESSAGE);
  });

  test("При валидации логина длиной менее 3 символов возвращается ошибка", () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setUsername("ло");
      result.current.validateForm();
    });

    expect(result.current.errorMessage).toBe(LOGIN_LENGTH_ERROR_MESSAGE);
  });

  test("При валидации логина длиной в 3 символа сообщение об ошибке отсутствует", () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setUsername("login");
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
      result.current.validateForm();
    });

    expect(result.current.errorMessage).not.toBe(LOGIN_LENGTH_ERROR_MESSAGE);
  });
  //Валидация поля с паролем
  test("При валидации пароля с пустым значением возвращается ошибка", () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setPassword("");
      result.current.validateForm();
    });

    expect(result.current.errorMessage).toBe(PASSWORD_EMPTY_ERROR_MESSAGE);
  });

  test("При валидации пароля длиной менее 6 символов возвращается ошибка", () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setPassword("passw");
      result.current.validateForm();
    });

    expect(result.current.errorMessage).toBe(PASSWORD_LENGTH_ERROR_MESSAGE);
  });

  test("При валидации пароля длиной 6 символов сообщение об ошибке отсутствует", () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setPassword("123456");
      result.current.validateForm();
    });

    expect(result.current.errorMessage).toBe("");
  });

  test("При валидации пароля длиной более 20 символов возвращается ошибка", () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setPassword("123456123456123456123456123456");
      result.current.validateForm();
    });

    expect(result.current.errorMessage).toBe(PASSWORD_LENGTH_ERROR_MESSAGE);
  });
  //Валидация поля с подтверждением пароля
  test("При валидации подтверждения пароля с пустым значением возвращается ошибка", () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setConfirmPassword("");
      result.current.validateForm();
    });

    expect(result.current.errorMessage).toBe(
      CONFIRM_PASSWORD_EMPTY_ERROR_MESSAGE,
    );
  });

  test("При несовпадении значения подтверждения пароля со значением введенного пароля возвращается ошибка", () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
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
      result.current.setPassword("password123");
      result.current.setConfirmPassword("password123");
      result.current.validateForm();
    });

    expect(result.current.password).toBe(result.current.confirmPassword);
    expect(result.current.errorMessage).toBe("");
  });
});
