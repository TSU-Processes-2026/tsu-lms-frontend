import { DraftResponse, DraftTeams } from '@/types/command/Draft';
import { ArrowLeft } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { DraftTeam } from './DraftTeam';
import { useProfile } from '@/hooks/profile/useProfile';

interface DraftContentProps {
    navigate: NavigateFunction;
    draft: DraftResponse;
}

export const DraftContent = ({ draft, navigate }: DraftContentProps) => {
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
    };
    const [currentDraft, setDraft] = useState<DraftResponse>(draft);
    const { profile } = useProfile();

    const handleUpdateDraft = (update: DraftResponse) => {
        setDraft({ ...update });
    };

    const currentCaptain = currentDraft.currentCaptainId
        ? currentDraft.teams
              .find((team) => team.captainId === currentDraft.currentCaptainId)
              ?.members.find((member) => member.isCaptain)
        : null;

    const currentCaptainTeam = currentDraft.teams.find(
        (team) => team.captainId === currentDraft.currentCaptainId,
    );

    const isDraftActive = currentDraft.isActive && !currentDraft.isCompleted;
    const canPick = isDraftActive && !!currentCaptainTeam;
    const isCurrentCaptainSelects = currentDraft.currentCaptainId === profile.id;

    return (
        <div className='w-full mx-auto flex flex-col gap-4 relative'>
            <ArrowLeft
                className='absolute left-0 top-0 text-gray-500 hover:text-blue-600 transition-all cursor-pointer'
                onClick={() => {
                    navigate(-1);
                }}
            />
            <div className='max-w-4xl w-full mx-auto'>
                <h2 className='font-bold text-4xl mb-4'>
                    Создание команд в режиме <strong>Draft</strong>
                </h2>

                {currentDraft.isActive && !currentDraft.isCompleted && (
                    <div className='p-4 bg-slate-50 border border-slate-100 rounded-xl backdrop-blur-sm shadow-md'>
                        <p className='text-xl text-slate-700 font-semibold'>
                            Раунд: {currentDraft.currentRound}
                        </p>
                        <p className='text-xl text-slate-500 mt-1 flex flex-row gap-2'>
                            Выбирает:{' '}
                            <p className='text-amber-700 font-medium'>
                                {currentCaptain?.username || 'Не определен'}
                            </p>
                        </p>
                    </div>
                )}

                {currentDraft.isCompleted && (
                    <div className='p-4 bg-amber-50 border border-amber-100 rounded-xl backdrop-blur-sm shadow-md'>
                        <p className='text-xl text-amber-700 font-semibold'>
                            Распределение по командам завершено.
                        </p>
                        <p className='text-xl text-amber-700 font-semibold'>
                            Количество раундов: {currentDraft.currentRound}
                        </p>
                    </div>
                )}

                {!currentDraft.isActive && !currentDraft.isCompleted && (
                    <div className='p-4 bg-blue-50 border border-blue-100 rounded-xl backdrop-blur-sm shadow-md'>
                        <p className='text-xl text-blue-700 font-semibold'>
                            Драфт еще не начат. Дождитесь начала формирования команд.
                        </p>
                    </div>
                )}

                <div className='flex rounded-3xl pt-2'>
                    <div className='flex-1 overflow-y-auto py-8'>
                        <form onSubmit={handleSubmit} className='space-y-5'>
                            {currentCaptainTeam ? (
                                <DraftTeam
                                    team={currentCaptainTeam}
                                    availableStudents={currentDraft.availableStudents}
                                    onUpdate={handleUpdateDraft}
                                    isDraftActive={isDraftActive}
                                    isCurrentCaptain={isCurrentCaptainSelects}
                                />
                            ) : (
                                <div className='text-center py-8 text-gray-500'>
                                    {currentDraft.isActive && !currentDraft.isCompleted
                                        ? 'Загрузка информации о команде...'
                                        : 'Драфт завершен. Все команды сформированы.'}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
