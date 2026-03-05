import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../api/logout/logout";
import { ROOT_URL } from "../../constants/paths/paths";
import { useTokenStore } from "../auth/useTokenStore";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants/auth/auth";

export const useLogout = () => {
  const { refreshToken } = useTokenStore();
  const navigate = useNavigate();
  const logout = async () => {
    try {
      await logoutUser(refreshToken || "");
    } catch (error) {
      console.log(error);
    } finally {
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
      localStorage.clear();
      navigate(ROOT_URL);
    }
  };
  return { logout };
};
