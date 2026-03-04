import { useState } from "react";
import {
  CONFIRM_PASSWORD_EMPTY_ERROR_MESSAGE,
  CONFIRM_PASSWORD_FAILED_ERROR_MESSAGE,
  LOGIN_EMPTY_ERROR_MESSAGE,
  LOGIN_LENGTH_ERROR_MESSAGE,
  PASSWORD_EMPTY_ERROR_MESSAGE,
  PASSWORD_LENGTH_ERROR_MESSAGE,
} from "../../../constants/error/errorMessages";

export const useRegisterForm = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setErrorMessage("");
    validateForm();
    if (errorMessage !== "") {
      return;
    }
  };

  const validateForm = (): void => {
    if (!validateLogin()) return;
    if (!validatePassword()) return;
    if (!validateConfirmPassword()) return;
  };

  const validateLogin = (): boolean => {
    if (username === null || username === undefined || username.trim() === "") {
      setErrorMessage(LOGIN_EMPTY_ERROR_MESSAGE);
      return false;
    }
    if (username.trim().length < 3 || username.trim().length > 50) {
      setErrorMessage(LOGIN_LENGTH_ERROR_MESSAGE);
      return false;
    }
    return true;
  };

  const validatePassword = (): boolean => {
    if (password === null || password === undefined || password.trim() === "") {
      setErrorMessage(PASSWORD_EMPTY_ERROR_MESSAGE);
      return false;
    }
    if (password.trim().length < 6 || password.trim().length > 20) {
      setErrorMessage(PASSWORD_LENGTH_ERROR_MESSAGE);
      return false;
    }
    return true;
  };

  const validateConfirmPassword = (): boolean => {
    if (
      confirmPassword === null ||
      confirmPassword === undefined ||
      confirmPassword.trim() === ""
    ) {
      setErrorMessage(CONFIRM_PASSWORD_EMPTY_ERROR_MESSAGE);
      return false;
    }
    if (password.trim() !== confirmPassword.trim()) {
      setErrorMessage(CONFIRM_PASSWORD_FAILED_ERROR_MESSAGE);
      return false;
    }
    return true;
  };

  return {
    username,
    password,
    confirmPassword,
    errorMessage,
    setUsername,
    setPassword,
    setConfirmPassword,
    setErrorMessage,
    onSubmit,
    validateForm,
  };
};
