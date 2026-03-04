import axios from "axios";
import { register } from "./register";
import { UserResponse } from "../../types/user/UserResponse";
import { RegisterRequest } from "../../types/auth/RegisterRequest";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("register: Тесты для запросов на сервер", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  //успешные сценарии
  test("После успешной регистрации должен вернуться 200 статус и тело ответа", async () => {
    const successResponse: UserResponse = {
      id: "some-unique-uuid",
      username: "test_user",
    };

    const validRegisterData: RegisterRequest = {
      username: "test_user",
      password: "password123",
    };

    mockedAxios.post.mockResolvedValueOnce(successResponse);

    const response = await register(validRegisterData);

    expect(response).not.toBeNull();
    expect(response?.status).toBe(200);
    expect(response?.data).toEqual(successResponse);

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });
  //негативные сценарии
  test("После отправки невалидной формы должен вернуться ответ со статусом 400 и сообщением об ошибке", async () => {
    const badRequestData: RegisterRequest = {
      username: "dd",
      password: "passw",
    };

    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { message: "Неверные данные" },
      },
      isAxiosError: true,
    });

    await expect(register(badRequestData)).rejects.toMatchObject({
      response: {
        status: 400,
        data: { message: "Неверные данные" },
      },
    });

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  test("После отправки формы с пустыми полями должен вернуться ответ со статусом 400 и сообщением об ошибке", async () => {
    const emptyRequestData: RegisterRequest = {
      username: "",
      password: "",
    };

    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { message: "Неверные данные" },
      },
      isAxiosError: true,
    });

    await expect(register(emptyRequestData)).rejects.toMatchObject({
      response: {
        status: 400,
        data: { message: "Неверные данные" },
      },
    });

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  test("При попытке создать аккаунт с занятым логином должен вернуться ответ со статусом 409 и сообщением об ошибке", async () => {
    const badRequestData: RegisterRequest = {
      username: "not_unique_username",
      password: "password123",
    };

    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 409,
        data: { message: "Введенный логин уже занят" },
      },
      isAxiosError: true,
    });

    await expect(register(badRequestData)).rejects.toMatchObject({
      response: {
        status: 409,
        data: { message: "Введенный логин уже занят" },
      },
    });

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });
});
