import { Team } from '@/types/command/Team';
import { Crown, UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommandParticipantsModalProps {
    commandNumber: number;
    onClose: () => void;
    teams: Team[];
    currentUserId: string;
    commandId: string;
}

const CommandParticipantsModal = ({
    onClose,
    commandNumber,
    teams,
    currentUserId,
    commandId,
}: CommandParticipantsModalProps) => {
    const members: Team =
        teams !== undefined && teams.length > 0
            ? teams.filter((item) => item.id == commandId)[0]
            : {
                  id: '',
                  subjectId: '',
                  memberIds: [],
                  members: [],
              };
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
    const navigate = useNavigate();

    const handleEditTeam = () => {
        navigate(`/subject/${members.subjectId}/teams/${commandId}/edit`);
    };

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
                    <div className='mb-5 p-4 bg-amber-100 rounded-2xl border border-amber-100 flex flex-row items-center gap-4'>
                        ⚠️
                        <p className='font-medium text-lg text-amber-700'> Капитан не выбран </p>
                    </div>
                    <div className='space-y-3'>
                        {!members || members.members.length === 0 ? (
                            <div className='text-slate-400 text-center'>Нет участников</div>
                        ) : (
                            members.members.map((participant) => {
                                const isSelf = participant.userId === currentUserId;
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
                                                        {isSelf && (
                                                            <span className='text-xs text-slate-400'>
                                                                (вы)
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
                <div className='px-8 py-5 border-t border-slate-100 flex justify-start gap-4 bg-slate-50/50 shrink-0'>
                    <button
                        className='px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200 w-full'
                        onClick={onClose}
                    >
                        Закрыть
                    </button>
                    <button
                        className='bg-linear-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all w-full'
                        onClick={handleEditTeam}
                    >
                        Изменить состав команды
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommandParticipantsModal;
