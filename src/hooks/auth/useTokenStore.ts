import { useEffect, useState } from "react";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants/auth/auth";

export const useTokenStore = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const loadTokens = () => {
      const access = localStorage.getItem(ACCESS_TOKEN) || null;
      const refresh = localStorage.getItem(REFRESH_TOKEN) || null;

      setAccessToken(access);
      setRefreshToken(refresh);
      setIsAuthenticated(Boolean(access && refresh));
    };

    loadTokens();
  }, []);

  const clearSession = async () => {
    await setAccessToken(null);
    await setRefreshToken(null);
    await setIsAuthenticated(false);

    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
  };

  const updateSession = async (
    newAccessToken: string,
    newRefreshToken: string,
  ) => {
    await setAccessToken(newAccessToken);
    await setRefreshToken(newRefreshToken);
    await setIsAuthenticated(true);

    localStorage.setItem(ACCESS_TOKEN, newAccessToken);
    localStorage.setItem(REFRESH_TOKEN, newRefreshToken);
  };

  return {
    accessToken,
    refreshToken,
    isAuthenticated,
    clearSession,
    updateSession,
    setAccessToken,
    setRefreshToken,
    setIsAuthenticated,
  };
};
