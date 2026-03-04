import axios from "axios";
import { logout } from "./logout";

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("logout: Тесты для запросов на сервер", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  //успешные сценарии
  test("После успешного выполения запроса должен вернуться ответ со статусом 204", async () => {
    mockAxios.post.mockResolvedValueOnce({
      status: 204,
      headers: {},
    });

    const response = await logout();
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(204);
  });
  //негативные сценарии
  test("После отправки невалидной формы должен вернуться ответ со статусом 400", async () => {
    mockAxios.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { message: "Неверные данные" },
      },
      isAxiosError: true,
    });

    await expect(logout()).rejects.toMatchObject({
      response: {
        status: 400,
        data: { message: "Неверные данные" },
      },
    });

    expect(mockAxios.post).toHaveBeenCalledTimes(1);
  });

  test("После отправки просроченного или невалидного токена должен вернуться ответ со статусом 401", async () => {
    mockAxios.post.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { message: "Невалидный токен" },
      },
      isAxiosError: true,
    });

    await expect(logout()).rejects.toMatchObject({
      response: {
        status: 401,
        data: { message: "Невалидный токен" },
      },
    });

    expect(mockAxios.post).toHaveBeenCalledTimes(1);
  });
});
