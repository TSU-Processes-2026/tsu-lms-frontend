import { act, renderHook } from "@testing-library/react";
import { useLoginForm } from "./useLoginForm";

describe("useLoginForm validation data tests", () => {
  const mockOnSubmit = jest.fn();

  test("Поля формы должны инициализироваться пустыми значениями", () => {
    const { result } = renderHook(() => useLoginForm);

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

  test("При валидации логина длиной менее 3 символов возвращается ошибка", () => {
    const { result } = renderHook(() => useLoginForm());
    const errorMessage = "Длина логина должна быть не менее 3";

    act(() => {
      result.current.setUsername("ло");
    });

    act(() => {
      result.current.validateForm();
      result.current.setErrorMessage(errorMessage);
    });

    expect(result.current.errorMessage).toBe(errorMessage);
  });

  test("При валидации логина длиной в 3 символа сообщение об ошибке отсутствует", () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setUsername("лог");
    });

    act(() => {
      result.current.validateForm();
      result.current.setErrorMessage("");
    });

    expect(result.current.errorMessage).toBe("");
  });

  test("При валидации пароля длиной менее 6 символов возвращается ошибка", () => {
    const { result } = renderHook(() => useLoginForm());
    const errorMessage = "Длина пароля должна быть от 6 до 20 символов";

    act(() => {
      result.current.setPassword("passw");
    });

    act(() => {
      result.current.validateForm();
      result.current.setErrorMessage(errorMessage);
    });

    expect(result.current.errorMessage).toBe(errorMessage);
  });

  test("При валидации пароля длиной более 20 символов возвращается ошибка", () => {
    const { result } = renderHook(() => useLoginForm());
    const errorMessage = "Длина пароля должна быть от 6 до 20 символов";

    act(() => {
      result.current.setPassword("passwordpasswordpassword");
    });

    act(() => {
      result.current.validateForm();
      result.current.setErrorMessage(errorMessage);
    });

    expect(result.current.errorMessage).toBe(errorMessage);
  });

  test("При валидации пароля длиной 6 символов сообщение об ошибке отсутствует", () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setPassword("passwo");
    });

    act(() => {
      result.current.validateForm();
      result.current.setErrorMessage("");
    });

    expect(result.current.errorMessage).toBe("");
  });

  test("При валидации пароля длиной 20 символов сообщение об ошибке отсутствует", () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setPassword("passwordpassword1234");
    });

    act(() => {
      result.current.validateForm();
      result.current.setErrorMessage("");
    });

    expect(result.current.errorMessage).toBe("");
  });

  test("При валидации формы с валидными данными сообщение об ошибке отсутствует", () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setUsername("testuser");
      result.current.setPassword("password123");
    });

    act(() => {
      result.current.validateForm();
      result.current.setErrorMessage("");
    });

    expect(result.current.errorMessage).toBe("");
  });
});

describe("navigation tests", () => {
  test("После успешной авторизации ползователь должен быть перенаправлен на главную страницу", () => {});

  test('При нажатии на кнопку " Зарегистрироваться" пользователь должен быть перенаправлен на страницу регистрации', () => {});
});
