import axios, { type AxiosResponse } from "axios";
import { RegisterRequest } from "../../types/auth/RegisterRequest";
import { UserResponse } from "../../types/user/UserResponse";
import { DEV_URL, PROD_URL, MOCK_URL } from "../../constants/config/config";

const BASE_URL = DEV_URL || PROD_URL || MOCK_URL;

export const register = async (
  data: RegisterRequest,
): Promise<AxiosResponse<UserResponse>> => {
  try {
    const response = await axios.post<UserResponse>(
      `${BASE_URL}/auth/register`,
      data,
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
