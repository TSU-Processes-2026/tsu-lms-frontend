import { useState } from "react";

export const useLoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const validateForm = () => {};
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  return {
    username,
    password,
    errorMessage,
    setUsername,
    setPassword,
    setErrorMessage,
    validateForm,
    onSubmit,
  };
};
