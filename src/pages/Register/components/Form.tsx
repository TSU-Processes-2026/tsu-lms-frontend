import { AlertCircle } from "lucide-react";
import { useState } from "react";

interface FormProps {
  onSubmit: any;
}

export const RegisterForm = ({ onSubmit }: FormProps) => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleLoginPage = () => {
    window.location.href = "/login";
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
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Логин
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUserName(e.target.value);
              setError("");
            }}
            placeholder="ivanov_ivan"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Пароль
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Подтвердите пароль
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setError("");
            }}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          Зарегистрироваться
        </button>
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          Уже есть аккаунт?{" "}
          <button
            type="button"
            onClick={handleLoginPage}
            className="text-purple-600 font-semibold hover:underline"
          >
            Войти
          </button>
        </p>
      </div>
    </form>
  );
};
