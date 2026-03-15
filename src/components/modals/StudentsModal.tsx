const StudentsModal = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Участники предмета</h3>
                        <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm text-slate-500">Название предмета</p>
                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-mono font-bold">CODE</span>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-slate-100 rounded-full transition-colors" onClick={onClose}>
                        {/* Иконка закрытия */}
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 bg-linear-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md shrink-0">
                                    {/* Иконка пользователя */}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-bold text-slate-800">Имя пользователя</p>
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold flex items-center gap-1">Студент</span>
                                    </div>
                                    <p className="text-sm text-slate-400 mt-0.5">email@example.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="student">Студент</option>
                                    <option value="teacher">Преподаватель</option>
                                    <option value="admin">Админ</option>
                                </select>
                                <button className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                    {/* Иконка удаления */}
                                </button>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-5 border-2 border-dashed border-slate-200 rounded-2xl p-5 flex items-center justify-center gap-2 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30 transition-all font-semibold">
                        {/* Иконка добавления */} Добавить участника вручную
                    </button>
                    <div className="mt-5 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <p className="text-xs font-semibold text-amber-700 mb-1">📋 Пригласительный код</p>
                        <p className="text-xs text-amber-600 mb-2">Поделитесь этим кодом со студентами:</p>
                        <div className="bg-white rounded-xl border border-amber-200 px-4 py-3 text-center font-mono text-xl font-bold text-amber-800 tracking-widest">
                            CODE
                        </div>
                    </div>
                </div>
                <div className="px-8 py-5 border-t border-slate-100 flex justify-end bg-slate-50/50 shrink-0">
                    <button className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all">
                        Готово
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentsModal;