import type { AxiosResponse } from "axios";
import type { LoginRequest } from "../../types/auth/LoginRequest";
import type { TokenResponse } from "../../types/token/TokenResponse";

export const login = async (
  data: LoginRequest,
): Promise<AxiosResponse<TokenResponse, any, {}> | null> => {
  return null;
};
