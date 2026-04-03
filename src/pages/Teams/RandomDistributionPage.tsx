import { useSendAllTeamManually } from '@/hooks/command/useCreateTeamManually';
import { Team } from '@/types/command/Team';
import { ArrowLeft, Dices, Send, UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const RandomDistributionPage = () => {
    const { subjectId } = useParams();
    const teams: Team[] = Array(3).fill({
        id: '1',
        subjectId: '1',
        memberIds: [],
        members: [
            {
                userId: '123',
                username: 'test_user',
            },
            {
                userId: '123',
                username: 'test_user2',
            },
            {
                userId: '123',
                username: 'test_user3',
            },
        ],
    });
    const navigate = useNavigate();
    const { sendAll } = useSendAllTeamManually(subjectId ?? '');
    const [distributedTeams, setDistributed] = useState<string[]>([]);
    const handleSendAll = async () => {
        const res = await sendAll({ teams: { memberIds: distributedTeams } });
        if (res)
            return (
                <div className='p-4 bg-green-50 border-b-green-50 rounded-xl border border-green-100'>
                    <p className='text-xs text-green-700 font-semibold mb-1'>✅ Успех</p>
                    <p className='text-xs text-green-600'>{'Команды созданы'}</p>
                </div>
            );
    };
    return (
        <div className='w-full flex flex-col gap-8 relative'>
            <ArrowLeft
                className='absolute left-0 top-0 text-gray-500 hover:text-blue-600 transition-all cursor-pointer'
                onClick={() => {
                    navigate(-1);
                }}
            />
            <div className='flex flex-col gap-8 max-w-4xl w-full mx-auto'>
                <h2 className='font-bold text-4xl'>Cлучайное распределение</h2>
                <div className='flex flex-row gap-3'>
                    <button
                        onClick={() => {}}
                        className='p-2 hover:bg-slate-100 rounded-full transition-colors flex flex-row gap-3 items-center bg-linear-to-r from-purple-600 to-blue-700 text-white px-6 py-3 font-bold shadow-lg shadow-purple-200/50 cursor-pointer'
                    >
                        <Dices size={22} className='text-white' />
                        Распределить
                    </button>
                    <button
                        onClick={() => {}}
                        className='p-2 hover:bg-slate-100 rounded-full transition-colors flex flex-row gap-3 items-center bg-linear-to-r from-green-600 to-green-700 text-white px-6 py-3 font-bold shadow-lg shadow-purple-200/50 cursor-pointer'
                    >
                        <Send size={22} className='text-white' />
                        Отправить
                    </button>
                </div>
                <div className='flex'>
                    <div className='flex-1 overflow-y-auto'>
                        <form onSubmit={() => {}} className='space-y-5'>
                            <div className='space-y-3 flex flex-col gap-4'>
                                {teams.map((team, index) => {
                                    return (
                                        <div className='space-y-3 bg-white p-8 rounded-2xl shadow-md border border-slate-100'>
                                            <h3 className='font-semibold text-slate-700 text-xl'>
                                                Команда {index + 1}
                                            </h3>
                                            {team.members.map((participant) => {
                                                return (
                                                    <div
                                                        key={participant.userId}
                                                        className='flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all'
                                                    >
                                                        <div className='flex items-center gap-4'>
                                                            <div className='w-11 h-11 bg-linear-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md shrink-0'>
                                                                <UserIcon
                                                                    size={20}
                                                                    className='text-white'
                                                                />
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
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
