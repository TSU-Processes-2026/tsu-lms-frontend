import { renderHook, waitFor } from "@testing-library/react";
import { useTokenStore } from "./useTokenStore";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants/auth/auth";
import { act } from "react";

const mockLocalStorage = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("useTokenStore: Тесты получения и сохранения токенов и localStorage", () => {
  const getHookInstance = () => {
    const { result } = renderHook(() => useTokenStore());
    return result.current;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Значение accessToken при монтировании должно быть проинициализировано null-ом", () => {
    const hook = getHookInstance();
    expect(hook.accessToken).toBe(null);
  });

  test("Значение refreshToken при монтировании должно быть проинициализировано null-ом", () => {
    const hook = getHookInstance();
    expect(hook.refreshToken).toBe(null);
  });

  test("Значение isAuthenticated при монтировании должно быть проинициализировано как false", () => {
    const hook = getHookInstance();
    expect(hook.isAuthenticated).toBe(false);
  });

  test("При отсутствии значения accessToken в localStorage, значение accessToken из хука должно оставаться null-ом", () => {
    mockLocalStorage.getItem.mockReturnValueOnce(null);
    const hook = getHookInstance();

    const token = localStorage.getItem(ACCESS_TOKEN);

    expect(token).toBe(undefined);
    expect(hook.accessToken).toBe(null);
  });

  test("При отсутствии значения refreshToken в localStorage, значение refreshTokne из хука должно оставаться null-ом", () => {
    mockLocalStorage.getItem.mockReturnValueOnce(null);

    const hook = getHookInstance();

    const refresh = localStorage.getItem(REFRESH_TOKEN);

    expect(refresh).toBe(undefined);
    expect(hook.refreshToken).toBe(null);
  });

  test("При отсутствии значений accessToken и refreshToken в localStorage, значение isAuthenticated false", () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null);
    const hook = getHookInstance();

    expect(hook.accessToken).toBe(null);
    expect(hook.refreshToken).toBe(null);
    expect(hook.isAuthenticated).toBe(false);
  });

  test("При наличии значения accessToken в localStorage, значение accessToken из хука должно быть инициализировано этим значением", () => {
    const mockedTokenValue = "mock-accessToken";
    mockLocalStorage.getItem.mockReturnValueOnce(mockedTokenValue);
    const hook = getHookInstance();

    expect(hook.accessToken).not.toBe(null);
    expect(hook.accessToken).toBe(mockedTokenValue);
  });

  test("При наличии значения refreshToken в localStorage, значение refreshToken из хука должно быть инициализировано этим значением", () => {
    const mockedRefreshValue = "mock-refreshToken";
    mockLocalStorage.getItem
      .mockReturnValueOnce("access")
      .mockReturnValueOnce(mockedRefreshValue);
    const hook = getHookInstance();

    expect(hook.refreshToken).not.toBe(null);
    expect(hook.refreshToken).toBe(mockedRefreshValue);
  });

  test("При наличии пары токенов, значение isAuthenticated true", () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce("mock-accessToken")
      .mockReturnValueOnce("mock-refreshToken");

    const hook = getHookInstance();

    expect(hook.accessToken).not.toBe(null);
    expect(hook.refreshToken).not.toBe(null);
    expect(hook.isAuthenticated).toBe(true);
  });

  test("При монтировании хука эффект для инициализации значений должен отработать 1 раз", () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce("mock-accessToken")
      .mockReturnValueOnce("mock-refreshToken");
    const hook = getHookInstance();

    act(() => {
      hook.setAccessToken;
      hook.setRefreshToken;
    });

    expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(2);
  });

  test("При сбросе сессии данные должны очищаться из localStorage", async () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce("mock-accessToken")
      .mockReturnValueOnce("mock-refreshToken");

    const { result } = renderHook(() => useTokenStore());

    await waitFor(() => {
      expect(result.current.accessToken).toBe("mock-accessToken");
    });

    await act(async () => {
      await result.current.clearSession();
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(ACCESS_TOKEN);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(REFRESH_TOKEN);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2);

    expect(result.current.accessToken).toBeNull();
    expect(result.current.refreshToken).toBeNull();
  });

  test("При обновлении сессии в localStorage должна сохраняться новая пара токенов", async () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce("mock-accessToken")
      .mockReturnValueOnce("mock-refreshToken");

    const { result } = renderHook(() => useTokenStore());

    await waitFor(() => {
      expect(result.current.accessToken).toBe("mock-accessToken");
    });

    const prevAccess = result.current.accessToken;
    const prevRefresh = result.current.refreshToken;
    const newAccess = "newAccess";
    const newRefresh = "newRefresh";

    await act(async () => {
      result.current.updateSession(newAccess, newRefresh);
    });

    await waitFor(() => {
      expect(result.current.accessToken).toBe(newAccess);
    });

    expect(result.current.accessToken).not.toBeNull();
    expect(result.current.accessToken).not.toBe(prevAccess);
    expect(result.current.accessToken).toBe(newAccess);

    expect(result.current.refreshToken).not.toBeNull();
    expect(result.current.refreshToken).not.toBe(prevRefresh);
    expect(result.current.refreshToken).toBe(newRefresh);

    expect(result.current.isAuthenticated).toBe(true);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      ACCESS_TOKEN,
      newAccess,
    );
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      REFRESH_TOKEN,
      newRefresh,
    );
  });
});
