import { useState } from "react";

export const useRegisterForm = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const onSubmit = async (e: React.FormEvent): Promise<void> => {};

  const validateForm = (): void => {};

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
