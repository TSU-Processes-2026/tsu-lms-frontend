import axios, { AxiosResponse } from "axios";
import { RefreshTokenRequest } from "../../types/token/RefreshTokenRequest";
import { TokenResponse } from "../../types/token/TokenResponse";
import { DEV_URL, PROD_URL, MOCK_URL } from "../../constants/config/config";

const BASE_URL = DEV_URL || PROD_URL || MOCK_URL;

export const refresh = async (
  refreshToken: RefreshTokenRequest,
): Promise<AxiosResponse<TokenResponse>> => {
  try {
    const response = await axios.post<TokenResponse>(
      `${BASE_URL}/auth/refresh`,
      refreshToken,
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
