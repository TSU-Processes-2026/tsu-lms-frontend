import { BookOpen, ChevronLeft } from "lucide-react";
import { RegisterForm } from "./components/Form";

export const RegisterPage = () => {
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleGoBack = () => {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-slate-500 hover:text-purple-600 font-medium text-sm mb-6 transition-colors"
        >
          <ChevronLeft size={18} /> Назад
        </button>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-200/50">
              <BookOpen className="text-white w-7 h-7" />
            </div>
            <span className="font-bold text-3xl bg-gradient-to-r from-purple-900 to-purple-700 bg-clip-text text-transparent">
              StudyHub
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Регистрация
          </h2>
          <p className="text-slate-500">Создайте новый аккаунт</p>
        </div>
        <RegisterForm onSubmit={handleRegister} />
      </div>
    </div>
  );
};
