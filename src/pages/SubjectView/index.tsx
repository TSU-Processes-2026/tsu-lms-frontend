const SubjectView = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex border-b border-slate-200 mb-8 bg-white/60 backdrop-blur-sm rounded-t-3xl px-2 pt-2">
                <button className="px-6 py-3 font-semibold transition-all rounded-t-2xl text-blue-600 bg-white shadow-sm">Лента</button>
                <button className="px-6 py-3 font-semibold transition-all rounded-t-2xl text-slate-400 hover:text-slate-600">Студенты</button>
            </div>
            <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-slate-100">
                    <div className="flex gap-4">
                        <div className="w-11 h-11 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 shadow-lg">
                            {/* Иконка пользователя */}
                        </div>
                        <textarea className="w-full resize-none border-none bg-transparent p-2 text-slate-700 focus:ring-0 outline-none placeholder:text-slate-400" placeholder="Поделиться объявлением или материалом..." rows={2} />
                    </div>
                    <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-100">
                        <div className="flex gap-2">
                            <button className="px-4 py-2 hover:bg-slate-50 rounded-xl text-slate-600 flex items-center gap-2 text-sm font-semibold transition-all">
                                {/* Иконка загрузки */} Файл
                            </button>
                            <button className="px-4 py-2 hover:bg-purple-50 rounded-xl text-purple-600 flex items-center gap-2 text-sm font-semibold transition-all">
                                {/* Иконка задания */} Задание
                            </button>
                        </div>
                        <button className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-xl shadow-blue-200/50 hover:-translate-y-0.5 transition-all">
                            Опубликовать
                        </button>
                    </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-all">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-4">
                                <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg bg-linear-to-br from-amber-400 to-amber-600">
                                    {/* Иконка объявления */}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">Автор</p>
                                    <p className="text-xs text-slate-400 mt-1">Дата</p>
                                </div>
                            </div>
                            <button className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                {/* Иконка редактирования */}
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">Заголовок</h3>
                        <p className="text-slate-600 leading-relaxed">Текст объявления или материала</p>
                        <div className="mt-5 p-5 border border-slate-100 rounded-2xl bg-linear-to-br from-slate-50 to-slate-100/50 flex items-center justify-between hover:border-blue-200 cursor-pointer transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-md">{/* Иконка файла */}</div>
                                <div>
                                    <span className="font-semibold text-slate-800">Название файла</span>
                                    <p className="text-xs text-slate-400 mt-1">Размер файла</p>
                                </div>
                            </div>
                            <button className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">{/* Иконка скачивания */}</button>
                        </div>
                    </div>
                    <div className="bg-slate-50 border-t border-slate-100 p-5 space-y-3">
                        <div className="flex gap-3">
                            <div className="w-9 h-9 rounded-full bg-linear-to-br from-slate-200 to-slate-300 shadow-sm flex items-center justify-center text-xs font-bold shrink-0 text-slate-600">
                                {/* Аватар автора */}
                            </div>
                            <div className="flex-1 bg-white p-3 rounded-2xl shadow-sm">
                                <span className="font-bold text-slate-800 text-sm mr-2">Автор</span>
                                <span className="text-slate-600 text-sm">Комментарий</span>
                            </div>
                        </div>
                        <div className="flex gap-3 items-center pt-1">
                            <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-400 to-blue-600 shadow-lg flex items-center justify-center shrink-0">
                                {/* Иконка пользователя */}
                            </div>
                            <div className="flex-1 relative">
                                <input placeholder="Написать комментарий..." className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 pr-12 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm transition-all" />
                                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 transition-all">{/* Иконка отправки */}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-lg border border-slate-100 text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    {/* Иконка участников */}
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">Участники предмета</h4>
                <p className="text-slate-500 mb-2">Всего участников: <span className="font-bold text-slate-700">0</span></p>
                <p className="text-xs text-slate-400 font-mono mb-8">Код предмета: CODE</p>
                <button className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all">
                    Управление участниками
                </button>
            </div>
        </div>
    );
};

export default SubjectView;
