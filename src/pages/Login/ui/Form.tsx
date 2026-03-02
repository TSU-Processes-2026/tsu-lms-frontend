import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { Input } from "./Input";

interface FormProps {
  onSubmit: any;
}

export const LoginForm = ({ onSubmit }: FormProps) => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const handleRegister = () => {
    window.location.href = "/register";
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      <div className="space-y-5">
        <Input
          onChange={(e) => {
            setUserName(e.target.value);
            setError("");
          }}
          value={username}
          label="Логин"
          type={"text"}
          placeholder={"ivanov_ivan"}
          required={true}
        />
        <Input
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          value={password}
          label="Пароль"
          type={"password"}
          placeholder={"********"}
          required={true}
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          Войти
        </button>
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          Нет аккаунта?{" "}
          <button
            type="button"
            onClick={handleRegister}
            className="text-blue-600 font-semibold hover:underline"
          >
            Зарегистрироваться
          </button>
        </p>
      </div>
    </form>
  );
};
