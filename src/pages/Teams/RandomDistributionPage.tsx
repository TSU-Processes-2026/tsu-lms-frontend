import { useSendAllTeamManually } from '@/hooks/command/useCreateTeamManually';
import { useRandomDistribution } from '@/hooks/command/useRandomDistribution';
import { Team } from '@/types/command/Team';
import { ArrowLeft, Dices, Send, UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const RandomDistributionPage = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const { sendAll } = useSendAllTeamManually(subjectId ?? '');
    const {
        distributedTeams,
        distributionError,
        buttonDisabled,
        errorMessage,
        handleDistributeTeamsByRandomMode,
        handleWarningMessages,
        handleErrorMessages,
        handleSuggestParameters,
    } = useRandomDistribution(subjectId ?? '');

    const handleSendAll = async () => {
        const res = await sendAll({ teams: distributedTeams.teams });
        if (res)
            return (
                <div className='p-4 bg-green-50 border-b-green-50 rounded-xl border border-green-100'>
                    <p className='text-xl text-green-700 font-semibold mb-1'>✅ Успех</p>
                    <p className='text-lg text-green-600'>{'Команды созданы'}</p>
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
                        onClick={handleDistributeTeamsByRandomMode}
                        className='p-2 hover:bg-slate-100 rounded-full transition-colors flex flex-row gap-3 items-center bg-linear-to-r from-purple-600 to-blue-700 text-white px-6 py-3 font-bold shadow-lg shadow-purple-200/50 cursor-pointer'
                    >
                        <Dices size={22} className='text-white' />
                        Распределить
                    </button>
                    <button
                        onClick={handleSendAll}
                        className='px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-full shadow-lg shadow-purple-200/50 flex flex-row gap-3 items-center transition-all  duration-200 hover:from-green-700 hover:to-green-800 cursor-pointer disabled:bg-gray-400  disabled:from-gray-400 disabled:to-gray-500 disabled:hover:from-gray-400 disabled:hover:to-gray-500 disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-70'
                        disabled={buttonDisabled}
                    >
                        <Send size={22} className='text-white' />
                        Отправить
                    </button>
                </div>
                <div className='flex'>
                    <div className='flex-1 overflow-y-auto py-2'>
                        <form onSubmit={() => {}} className='space-y-5'>
                            <div className='space-y-3 flex flex-col gap-1'>
                                {errorMessage && (
                                    <div className='bg-red-50 border-b-red-50 rounded-xl border border-red-100  text-center my-4 py-8 backdrop-blur-sm shadow-md text-red-600 text-xl'>
                                        {errorMessage}
                                    </div>
                                )}

                                {distributionError && (
                                    <>
                                        {distributionError.errors.length > 0 && (
                                            <>
                                                <div className='p-4 bg-red-50 border-b-red-50 rounded-xl border border-red-100 backdrop-blur-sm shadow-md'>
                                                    <p className='text-lg text-red-700 font-semibold mb-1'>
                                                        ❌ Ошибка
                                                    </p>
                                                    <p className='text-md text-red-600 whitespace-pre-line px-2'>
                                                        {handleErrorMessages()}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                        {distributionError.warnings.length > 0 && (
                                            <div className='p-4 bg-orange-50 border-b-orange-50 rounded-xl border border-orange-100 backdrop-blur-sm shadow-md'>
                                                <p className='text-lg text-amber-700 font-semibold mb-1'>
                                                    ⚠️ Внимание
                                                </p>
                                                <p className='text-md text-amber-600 whitespace-pre-line px-2'>
                                                    {handleWarningMessages()}
                                                </p>
                                            </div>
                                        )}
                                        {distributionError.suggestedParameters && (
                                            <div className='p-4 bg-blue-50 border-b-blue-50 rounded-xl border border-blue-100 backdrop-blur-sm shadow-md'>
                                                <p className='text-lg text-blue-700 font-semibold mb-1'>
                                                    ℹ️ Рекомендации по разбиению команд:
                                                </p>
                                                <p className='text-md text-blue-600 whitespace-pre-line px-2'>
                                                    {handleSuggestParameters()}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {distributedTeams.teams.length > 0 &&
                                    distributedTeams.teams.map((team, index) => {
                                        return (
                                            <div className='space-y-3 bg-white p-8 rounded-2xl shadow-md border border-slate-100'>
                                                <h3 className='font-semibold text-slate-700 text-xl'>
                                                    Команда {index + 1}
                                                </h3>
                                                {team.memberIds.map((participant) => {
                                                    return (
                                                        <div
                                                            key={participant}
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
                                                                            {participant}
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
