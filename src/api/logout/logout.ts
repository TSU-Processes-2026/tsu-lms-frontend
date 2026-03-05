import axios, { AxiosResponse } from "axios";
import { DEV_URL, PROD_URL, MOCK_URL } from "../../constants/config/config";
import { UserResponse } from "../../types/user/UserResponse";

const BASE_URL = DEV_URL || PROD_URL || MOCK_URL;

export const logoutUser = async (
  refreshToken: string,
): Promise<AxiosResponse> => {
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
