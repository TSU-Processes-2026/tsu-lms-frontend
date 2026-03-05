import { AxiosResponse } from "axios";
import { RefreshTokenRequest } from "../../types/token/RefreshTokenRequest";
import { TokenResponse } from "../../types/token/TokenResponse";

export const refresh = async (
  refreshToken: RefreshTokenRequest,
): Promise<AxiosResponse<TokenResponse>> => {};
