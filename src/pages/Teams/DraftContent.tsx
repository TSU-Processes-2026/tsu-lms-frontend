import { DraftResponse } from '@/types/command/Draft';
import { ArrowLeft } from 'lucide-react';
import { FormEvent } from 'react';
import { NavigateFunction } from 'react-router-dom';

interface DraftContentProps {
    navigate: NavigateFunction;
    draft: DraftResponse;
}

export const DraftContent = ({ draft, navigate }: DraftContentProps) => {
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
    };
    const createdTeamDrafts = draft.teams;
    return (
        <div className='w-full mx-auto flex flex-col gap-4 relative'>
            <ArrowLeft
                className='absolute left-0 top-0 text-gray-500 hover:text-blue-600 transition-all cursor-pointer'
                onClick={() => {
                    navigate(-1);
                }}
            />
            <div className='max-w-4xl w-full mx-auto'>
                <h2 className='font-bold text-4xl mb-4'>Создание шаблонов команд</h2>
                <div className='flex border-b border-slate-200 mb-8 bg-white/60 backdrop-blur-sm rounded-3xl px-2 pt-2'>
                    <div className='flex-1 overflow-y-auto p-8'>
                        <form onSubmit={handleSubmit} className='space-y-5'></form>
                    </div>
                </div>
            </div>
        </div>
    );
};
