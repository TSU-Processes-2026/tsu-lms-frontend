import { fetchCommandParticipants } from '@/api/command/command';
import { CommandParticipant } from '@/types/command/CommandParticipant';
import { Crown, UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CommandParticipantsModalProps {
    commandNumber: number;
    onClose: () => void;
    currentUserId: string;
    commandId: string;
}

const CommandParticipantsModal = ({
    onClose,
    commandNumber,
    currentUserId,
    commandId,
}: CommandParticipantsModalProps) => {
    const [participants, setParticipants] = useState<CommandParticipant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            setError(null);
            try {
                const participantsData = await fetchCommandParticipants(commandId);
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
    }, [commandId]);

    const roleBadge: Record<string, React.ReactNode> = {
        captain: (
            <span className='px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1'>
                <Crown size={11} /> Капитан
            </span>
        ),
        student: (
            <span className='px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold flex items-center gap-1'>
                <UserIcon size={11} /> Студент
            </span>
        ),
    };

    if (loading) {
        return (
            <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
                <div className='bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col items-center justify-center p-10'>
                    <span className='text-lg text-slate-600'>Загрузка...</span>
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
                <div className='bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col items-center justify-center p-10'>
                    <span className='text-lg text-red-600'>
                        {error || 'Информация о составе недоступна'}
                    </span>
                    <button
                        className='mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold'
                        onClick={onClose}
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
            <div className='bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden'>
                <div className='px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0'>
                    <div>
                        <h3 className='text-xl font-bold text-slate-800'>
                            Участники команды {commandNumber + 1}
                        </h3>
                    </div>
                    <button
                        className='p-2 hover:bg-slate-100 rounded-full transition-colors'
                        onClick={onClose}
                    ></button>
                </div>
                <div className='flex-1 overflow-y-auto p-8'>
                    <div className='space-y-3'>
                        {participants.length === 0 ? (
                            <div className='text-slate-400 text-center'>Нет участников</div>
                        ) : (
                            participants.map((participant) => {
                                const role = participant.role
                                    ? participant.role.toLowerCase()
                                    : 'student';

                                const isSelf = participant.userId === currentUserId;
                                const validRole = ['captain', 'student'].includes(role)
                                    ? role
                                    : 'student';
                                return (
                                    <div
                                        key={participant.userId}
                                        className='flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all'
                                    >
                                        <div className='flex items-center gap-4'>
                                            <div className='w-11 h-11 bg-linear-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md shrink-0'>
                                                <UserIcon size={20} className='text-white' />
                                            </div>
                                            <div>
                                                <div className='flex items-center gap-2 flex-wrap'>
                                                    <p className='font-bold text-slate-800'>
                                                        {participant.username}
                                                    </p>
                                                    {roleBadge[validRole] || roleBadge['student']}
                                                    {isSelf && (
                                                        <span className='text-xs text-slate-400'>
                                                            (вы)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <div className='mt-5 p-4 bg-amber-50 rounded-2xl border border-amber-100'></div>
                </div>
                <div className='px-8 py-5 border-t border-slate-100 flex justify-end bg-slate-50/50 shrink-0'>
                    <button
                        className='bg-linear-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all'
                        onClick={onClose}
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommandParticipantsModal;
