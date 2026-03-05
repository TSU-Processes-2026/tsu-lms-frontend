import { useState } from "react";

export const useTokenStore = () => {
  const [accessToken, setAccessToken] = useState<string | null>();
  const [refreshToken, setRefreshToken] = useState<string | null>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>();

  const clearSession = () => {};

  const updateSession = (accessToken: string, refreshToken: string) => {};

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
