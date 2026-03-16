import React, {JSX, useEffect, useState} from 'react';
import { Crown, Shield, User as UserIcon } from 'lucide-react';
import { fetchSubjectParticipants } from '@/api/subject/subjectsPage';
import { Subject } from '@/types/subject/Subject';
import { Participant } from '@/hooks/subject/useSubjects';

/**
 * Modal window for displaying subject participants and invitation code.
 *
 * @param {object} props - Component props.
 * @param {() => void} props.onClose - Callback for closing the modal.
 * @param {string} props.subjectId - Subject identifier (UUID).
 * @returns {JSX.Element} Modal with participants and subject info.
 * @throws {Error} If loading participants fails.
 */
/**
 * Modal window for displaying subject participants and invitation code.
 *
 * @param {object} props - Component props.
 * @param {() => void} props.onClose - Callback for closing the modal.
 * @param {string} props.subjectId - Subject identifier (UUID).
 * @param {Subject | null} props.selectedSubject - Subject object for displaying info.
 * @returns {JSX.Element} Modal with participants and subject info.
 * @throws {Error} If loading participants fails.
 */
/**
 * Modal window for displaying subject participants and invitation code.
 *
 * @param {object} props - Component props.
 * @param {() => void} props.onClose - Callback for closing the modal.
 * @param {string} props.subjectId - Subject identifier (UUID).
 * @param {Subject | null} props.selectedSubject - Subject object for displaying info.
 * @param {string} props.currentUserId - Current user identifier.
 * @returns {JSX.Element} Modal with participants and subject info.
 * @throws {Error} If loading participants fails.
 */
const StudentsModal = ({ onClose, subjectId, selectedSubject, currentUserId }: { onClose: () => void; subjectId: string; selectedSubject: Subject | null; currentUserId: string }): JSX.Element => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!subjectId || subjectId === '' || subjectId === 'undefined') {
            setError('Некорректный идентификатор предмета');
            setLoading(false);
            return;
        }
        async function loadData() {
            setLoading(true);
            setError(null);
            try {
                const participantsData = await fetchSubjectParticipants(subjectId);
                setParticipants(participantsData);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message || 'Ошибка загрузки данных');
                } else {
                    setError('Ошибка загрузки данных');
                }
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [subjectId]);

    const roleBadge: Record<string, React.ReactNode> = {
        admin: (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1">
                <Crown size={11} /> Админ
            </span>
        ),
        teacher: (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1">
                <Shield size={11} /> Преподаватель
            </span>
        ),
        student: (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold flex items-center gap-1">
                <UserIcon size={11} /> Студент
            </span>
        ),
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col items-center justify-center p-10">
                    <span className="text-lg text-slate-600">Загрузка...</span>
                </div>
            </div>
        );
    }
    if (error || !selectedSubject) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col items-center justify-center p-10">
                    <span className="text-lg text-red-600">{error || 'Информация о предмете недоступна'}</span>
                    <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold" onClick={onClose}>Закрыть</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Участники предмета</h3>
                        <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm text-slate-500">{selectedSubject?.title || 'Название предмета'}</p>
                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-mono font-bold">{selectedSubject?.id || 'CODE'}</span>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-slate-100 rounded-full transition-colors" onClick={onClose}>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="space-y-3">
                        {participants.length === 0 ? (
                            <div className="text-slate-400 text-center">Нет участников</div>
                        ) : (
                            participants.map((participant) => {
                                const role = participant.role ? participant.role.toLowerCase() : 'student';
                                const isSelf = participant.userId === currentUserId;
                                return (
                                    <div key={participant.userId} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 bg-linear-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md shrink-0">
                                                <UserIcon size={20} className="text-white" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-bold text-slate-800">{participant.username}</p>
                                                    {roleBadge[role] || roleBadge['student']}
                                                    {isSelf && <span className="text-xs text-slate-400">(вы)</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500" value={role} disabled>
                                                <option value="student">Студент</option>
                                                <option value="teacher">Преподаватель</option>
                                                <option value="admin">Админ</option>
                                            </select>
                                            <button className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" disabled></button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <div className="mt-5 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <p className="text-xs font-semibold text-amber-700 mb-1">📋 Пригласительный код</p>
                        <p className="text-xs text-amber-600 mb-2">Поделитесь этим кодом со студентами:</p>
                        <div className="bg-white rounded-xl border border-amber-200 px-4 py-3 text-center font-mono text-xl font-bold text-amber-800 tracking-widest">
                            {selectedSubject?.id || 'CODE'}
                        </div>
                    </div>
                </div>
                <div className="px-8 py-5 border-t border-slate-100 flex justify-end bg-slate-50/50 shrink-0">
                    <button className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all" onClick={onClose}>
                        Готово
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentsModal;