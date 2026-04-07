import { DraftTeams } from '@/types/command/Draft';
import { TeamMember } from '@/types/command/Team';
import { UserIcon, X } from 'lucide-react';

interface DraftTeamProps {
    team: DraftTeams;
}

export const DraftTeam = ({ team }: DraftTeamProps) => {
    const { id, subjectId, name, captainId, members } = team;

    const findCaptain = (): TeamMember | null => {
        const captain: TeamMember = members.filter(
            (member) => member.isCaptain || member.userId === captainId,
        )[0];
        if (captain) {
            return captain;
        }
        return null;
    };

    const findStudents = (): TeamMember[] => {
        if (!members || members.length === 0) {
            return [];
        }
        return members.filter((member) => member.isCaptain === false);
    };

    const captain = findCaptain();
    const students = findStudents();

    return (
        <div className='flex flex-col gap-2 space-y-3 bg-white backdrop-blur-sm shadow-md rounded-2xl p-4 w-full'>
            {captain && (
                <div className='flex flex-col gap-2 items-start p-4'>
                    <h3 className='font-semibold text-slate-700'>Капитан команды:</h3>
                    <div
                        key={captain.userId}
                        className='flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all w-full'
                    >
                        <div className='flex items-center gap-4'>
                            <div className='w-11 h-11 bg-linear-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md shrink-0'>
                                <UserIcon size={20} className='text-white' />
                            </div>
                            <div>
                                <div className='flex items-center gap-2 flex-wrap'>
                                    <p className='font-bold text-slate-800'>{captain.username}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className='flex flex-col gap-2 items-start p-4'>
                <h3 className='font-semibold text-slate-700'>Участники команды:</h3>
                {students && students.length > 0 ? (
                    findStudents().map((participant) => {
                        return (
                            <div
                                key={participant.userId}
                                className='flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all w-full'
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
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className='text-center py-8 text-gray-500 w-full'>Список пуст</div>
                )}
            </div>
        </div>
    );
};
