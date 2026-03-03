import { useState } from "react";
import { login } from "../../../api/authorization/login";
import { TokenResponse } from "../../../types/token/TokenResponse";
import { AxiosResponse, isAxiosError } from "axios";
import { useNavigate } from "../../../hooks/useNavigate";

export const useLoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { navigate } = useNavigate();

  const isFormValid = (): boolean => {
    return validateUsername() && validatePassword();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!isFormValid()) return;

    try {
      const response: AxiosResponse<TokenResponse> = await login({
        username: username,
        password: password,
      });
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("sessionId", response.data.sessionId);
      navigate();
    } catch (error) {
      if (isAxiosError(error)) {
        setErrorMessage(error.response?.data.message);
      } else {
        setErrorMessage("Не удалось обработать запрос");
      }
    } finally {
      return;
    }
  };

  const validateUsername = (): boolean => {
    if (username === null || username === undefined || username.trim() === "") {
      setErrorMessage("Поле с логином не может быть пустым");
      return false;
    }
    if (username.trim().length < 3 || username.trim().length > 50) {
      setErrorMessage("Допустимая длина для логина: от 3 до 50 символов");
      return false;
    }
    return true;
  };

  const validatePassword = (): boolean => {
    if (password === null || password === undefined || password.trim() === "") {
      setErrorMessage("Поле с паролем не может быть пустым");
      return false;
    }
    if (password.trim().length < 6 || password.trim().length > 20) {
      setErrorMessage("Допустимая длина для пароля: от 6 до 20 символов");
      return false;
    }
    return true;
  };

  return {
    username,
    password,
    errorMessage,
    setUsername,
    setPassword,
    setErrorMessage,
    onSubmit,
    validatePassword,
    validateUsername,
    isFormValid,
  };
};
