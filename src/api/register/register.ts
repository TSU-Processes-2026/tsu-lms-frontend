import { type AxiosResponse } from "axios";
import { RegisterRequest } from "../../types/auth/RegisterRequest";
import { UserResponse } from "../../types/user/UserResponse";

export const register = async (
  data: RegisterRequest,
): Promise<AxiosResponse<UserResponse>> => {};
