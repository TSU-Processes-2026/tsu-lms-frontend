import { DraftResponse, DraftTeams } from '@/types/command/Draft';
import { ArrowLeft } from 'lucide-react';
import { FormEvent } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { DraftTeam } from './DraftTeam';

interface DraftContentProps {
    navigate: NavigateFunction;
    draft: DraftResponse;
}

export const DraftContent = ({ draft, navigate }: DraftContentProps) => {
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
    };
    const createdTeamDrafts: DraftTeams[] = draft.teams;
    console.log(draft);
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
                <div className='flex rounded-3xl px-2 pt-2'>
                    <div className='flex-1 overflow-y-auto p-8'>
                        <form onSubmit={handleSubmit} className='space-y-5'>
                            {createdTeamDrafts.map((team) => {
                                return <DraftTeam team={team} />;
                            })}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
