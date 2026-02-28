import React, { useState } from "react";
import { BookOpen, ChevronLeft, AlertCircle } from "lucide-react";
import { RegisterForm } from "./ui/Form";

export const LoginPage = () => {
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleGoBack = () => {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium text-sm mb-6 transition-colors"
        >
          <ChevronLeft size={18} /> Назад
        </button>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200/50">
              <BookOpen className="text-white w-7 h-7" />
            </div>
            <span className="font-bold text-3xl bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              StudyHub
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Добро пожаловать!
          </h2>
          <p className="text-slate-500">Войдите в свой аккаунт</p>
        </div>
        <RegisterForm onSubmit={handleLogin} />
      </div>
    </div>
  );
};
