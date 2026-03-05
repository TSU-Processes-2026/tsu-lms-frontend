import axios, { AxiosResponse } from "axios";
import { DEV_URL, PROD_URL, MOCK_URL } from "../../constants/config/config";
import { UserResponse } from "../../types/user/UserResponse";
import { REFRESH_TOKEN } from "../../constants/auth/auth";

const BASE_URL = DEV_URL || PROD_URL || MOCK_URL;

export const logout = async (): Promise<AxiosResponse> => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN);
  try {
    const response = await axios.post<UserResponse>(
      `${BASE_URL}/auth/logout`,
      { refreshToken: refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response;
  } catch (error) {
    throw error;
  }
};
