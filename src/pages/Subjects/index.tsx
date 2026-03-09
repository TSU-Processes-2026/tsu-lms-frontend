import React from 'react';
import { User as UserIcon } from 'lucide-react';
import { Subject } from "../../types/subjects/Subject.ts";

export const SubjectsPage: React.FC<{ subjects: Subject[]; onSelectSubject: (s: Subject) => void }> = ({ subjects, onSelectSubject }) => (
    <div className="max-w-6xl mx-auto">
        <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-800">Все предметы</h3>
            <p className="text-slate-500 text-sm mt-1">Выберите предмет для просмотра материалов</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map(s => {
                const Icon = s.icon;
                return (
                    <div key={s.id} onClick={() => onSelectSubject(s)}
                         className="group bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-2xl hover:shadow-blue-100/50 transition-all cursor-pointer">
                        <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${s.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                            <Icon size={28} className="text-white" />
                        </div>
                        <h4 className="font-bold text-lg mb-1 text-slate-800">{s.name}</h4>
                        <p className="text-xs text-slate-400 mb-1">Преподаватель: {s.teacher}</p>
                        <p className="text-xs font-mono text-slate-300 mb-4">Код: {s.code}</p>
                        <div className="mb-4">
                            <div className="flex justify-between mb-1">
                                <span className="text-[10px] font-semibold text-slate-500">Прогресс</span>
                                <span className="text-xs font-bold text-blue-600">{s.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full bg-linear-to-r ${s.color}`} style={{ width: `${s.progress}%` }} />
                            </div>
                        </div>
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center">
                                    <UserIcon size={12} className="text-slate-500" />
                                </div>
                            ))}
                            <div className="w-7 h-7 rounded-full border-2 border-white bg-white flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm">
                                +{s.students - 3}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);