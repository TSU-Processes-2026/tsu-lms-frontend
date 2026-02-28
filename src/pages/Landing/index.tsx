import { BookOpen, ClipboardCheck, MessageSquare } from "lucide-react";
import { FeatureCard } from "./ui/FeatureCard";

export const LandingPage = () => {
  const handleClick = () => {
    window.location.href = "/login";
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-slate-50 text-slate-900 overflow-hidden">
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200/50">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-2xl bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent tracking-tight">
            StudyHub
          </span>
        </div>
        <button
          onClick={handleClick}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-xl hover:shadow-blue-200/50 hover:-translate-y-0.5 transition-all"
        >
          Войти
        </button>
      </nav>
      <main className="max-w-7xl mx-auto px-6 p-8 pb-32 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl -z-10 opacity-40" />
        <div className="inline-block mb-6"></div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-tight">
          Учись и сотрудничай <br />
          на{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            StudyHub
          </span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Единое пространство для обучения, где студенты и преподаватели вместе
          работают над предметами, заданиями и решениями.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={handleClick}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-200/50 hover:-translate-y-1 transition-all"
          >
            Начать работу
          </button>
        </div>
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <FeatureCard
            title="Предметы"
            desc="Группировка по дисциплинам"
            icon={<BookOpen className="text-blue-600" size={28} />}
            gradient="from-blue-50 to-blue-100/50"
          />
          <FeatureCard
            title="Задания"
            desc="Тесты с вариантами ответов"
            icon={<ClipboardCheck className="text-cyan-600" size={28} />}
            gradient="from-cyan-50 to-cyan-100/50"
          />
          <FeatureCard
            title="Решения"
            desc="Обратная связь в реальном времени"
            icon={<MessageSquare className="text-purple-600" size={28} />}
            gradient="from-purple-50 to-purple-100/50"
          />
        </div>
      </main>
    </div>
  );
};
