import {ClipboardCheck} from "lucide-react";
import React from "react";

const CreateAssignmentModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50">
                            <ClipboardCheck className="text-white" size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Создать тест</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        {/* Иконка закрытия */}
                    </button>
                </div>
                <form className="flex-1 overflow-y-auto p-8">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Название теста</label>
                                <input type="text" placeholder="Тест: Основы алгебры"
                                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                       required />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Описание / инструкция</label>
                                <textarea placeholder="Опишите задание для студентов..."
                                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                          rows={3} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Максимум баллов</label>
                                <input type="number" min={1}
                                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                       required />
                            </div>
                            <div className="flex items-end">
                                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-700 font-medium flex-1 text-center">
                                    {/* Иконка количества вопросов */} 1 вопрос
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-slate-200 pt-6">
                            <div className="flex justify-between items-center mb-5">
                                <h4 className="font-bold text-slate-800">Вопросы</h4>
                                <button type="button"
                                        className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all">
                                    {/* Иконка добавления */} Добавить вопрос
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-bold text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200">Вопрос 1</span>
                                        <div className="flex items-center gap-3">
                                            <select className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg font-semibold outline-none focus:ring-2 focus:ring-blue-500">
                                                <option value="single">Одиночный выбор</option>
                                                <option value="multiple">Множественный выбор</option>
                                                <option value="input">Текстовый ответ</option>
                                                <option value="file">Загрузка файла</option>
                                            </select>
                                            <button type="button"
                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                {/* Иконка удаления */}
                                            </button>
                                        </div>
                                    </div>
                                    <input type="text" placeholder="Текст вопроса"
                                           className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl mb-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Варианты ответов:</p>
                                        {[1,2,3,4].map((_, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-2">
                                                <input type="radio" name="correct-1" className="shrink-0 accent-blue-600 w-4 h-4" />
                                                <input type="text" placeholder={`Вариант ${oIdx + 1}`}
                                                       className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                            </div>
                                        ))}
                                        <p className="text-[10px] text-slate-400 mt-1">☝️ Выберите правильный ответ</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
                        <button type="button" onClick={onClose}
                                className="flex-1 px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200">
                            Отмена
                        </button>
                        <button type="submit"
                                className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200/50 hover:-translate-y-0.5 transition-all">
                            Опубликовать тест
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAssignmentModal;
