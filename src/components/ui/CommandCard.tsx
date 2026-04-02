import { TeamMember } from '@/types/command/Team';
import { UserIcon, Users } from 'lucide-react';

interface CommandCardProps {
    index?: number;
    participants: TeamMember[];
    onClick: () => void;
}

export const CommandCard = ({ index = 0, participants, onClick }: CommandCardProps) => {
    const avatarLimit = 3;
    console.log(participants);
    const badgeCount =
        participants && participants.length > avatarLimit ? participants.length - avatarLimit : 0;
    return (
        <div
            key={index}
            className='bg-white/80 backdrop-blur-sm rounded-3xl p-4 shadow-md border border-slate-100 flex flex-col items-start'
        >
            <div className='w-full flex flex-row items-center gap-4'>
                <div className='w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center'>
                    <Users size={16} className='text-blue-500' />
                </div>
                <h4 className='text-xl font-bold text-slate-800 mb-2'>Команда номер {index + 1}</h4>
            </div>
            <div className='w-full flex flex-col py-4 px-2'>
                <div className='flex -space-x-2'>
                    <p className='text-slate-500 mr-2'>Всего участников: </p>
                    {participants &&
                        participants.slice(0, avatarLimit).map((index, participant) => (
                            <div
                                className='w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center'
                                data-testid={`participant-icon-${participant}`}
                            >
                                <UserIcon size={12} className='text-slate-500' />
                            </div>
                        ))}
                    {badgeCount > 0 && (
                        <div
                            className='w-7 h-7 rounded-full border-2 border-white bg-white flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm'
                            data-testid='badge'
                        >
                            +{badgeCount}
                        </div>
                    )}
                </div>
            </div>
            <button
                className='w-full bg-linear-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all'
                onClick={onClick}
            >
                Cостав команды
            </button>
        </div>
    );
};
