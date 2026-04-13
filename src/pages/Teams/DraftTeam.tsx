import { SingleSelect } from '@/components/ui/Select';
import { usePickStudent } from '@/hooks/command/useCreateDraft';
import { DraftResponse, DraftTeams } from '@/types/command/Draft';
import { TeamMember } from '@/types/command/Team';
import { UserIcon } from 'lucide-react';
import { useState } from 'react';

interface DraftTeamProps {
    team: DraftTeams;
    availableStudents: TeamMember[];
    onUpdate: (updatedDraft: DraftResponse) => void;
    isDraftActive: boolean;
    isCurrentCaptain: boolean;
}

export const DraftTeam = ({
    team,
    availableStudents,
    onUpdate,
    isDraftActive,
    isCurrentCaptain,
}: DraftTeamProps) => {
    const { captainId, members, subjectId } = team;
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { handlePickStudent } = usePickStudent(subjectId);

    const findCaptain = (): TeamMember | null => {
        const captain = members.find((member) => member.isCaptain || member.userId === captainId);
        return captain || null;
    };

    const captain = findCaptain();

    const handleSelectionChange = (newSelectedId: string | null) => {
        if (!isCurrentCaptain || !isDraftActive) return;
        setSelectedStudentId(newSelectedId);
    };

    const handleSubmit = async (): Promise<void> => {
        if (!selectedStudentId) return;
        if (!isCurrentCaptain || !isDraftActive) return;

        setIsSubmitting(true);
        try {
            const updatedDraft: DraftResponse | null = await handlePickStudent(selectedStudentId);

            if (updatedDraft) {
                onUpdate(updatedDraft);
                setSelectedStudentId(null);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const availableStudentsList = availableStudents.filter(
        (student) => !members.some((member) => member.userId === student.userId),
    );

    const canPick = isCurrentCaptain && isDraftActive && !isSubmitting;
    const hasAvailableStudents = availableStudentsList.length > 0;

    return (
        <div className='flex flex-col gap-2 space-y-3 bg-white backdrop-blur-sm shadow-md rounded-2xl p-4 w-full'>
            {captain && (
                <div className='flex flex-col gap-2 items-start p-4'>
                    <h3 className='font-semibold text-slate-700'>Капитан команды:</h3>
                    <div className='flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 w-full'>
                        <div className='flex items-center gap-4'>
                            <div className='w-11 h-11 bg-linear-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md shrink-0'>
                                <UserIcon size={20} className='text-white' />
                            </div>
                            <div>
                                <p className='font-bold text-slate-800'>{captain.username}</p>
                                {isCurrentCaptain && isDraftActive && (
                                    <span className='text-xs text-green-600 font-medium'>
                                        Ваша очередь выбирать
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className='px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold'>
                            Капитан
                        </span>
                    </div>
                </div>
            )}

            <div className='p-4'>
                <h3 className='font-semibold text-slate-700 mb-2'>Добавить участника</h3>

                {!isCurrentCaptain && isDraftActive && (
                    <div className='p-4 bg-blue-50 rounded-xl border border-blue-100 mb-4'>
                        <p className='text-sm text-blue-700'>
                            Сейчас выбирает другой капитан. Дождитесь своей очереди.
                        </p>
                    </div>
                )}

                {!isDraftActive && (
                    <div className='p-4 bg-gray-50 rounded-xl border border-gray-100 mb-4'>
                        <p className='text-sm text-gray-600'>
                            Формирование команд завершено. Выбор недоступен.
                        </p>
                    </div>
                )}

                <SingleSelect
                    members={availableStudentsList}
                    selectedId={selectedStudentId}
                    onChange={handleSelectionChange}
                    placeholder='Выберите участника для добавления...'
                    disabled={!canPick || !hasAvailableStudents}
                />

                <div className='flex gap-3 mt-3'>
                    <button
                        type='button'
                        onClick={handleSubmit}
                        disabled={!canPick || !selectedStudentId || isSubmitting}
                        className={`flex-1 px-6 py-3 rounded-xl font-bold shadow-lg transition-all 
                            ${
                                canPick && selectedStudentId && !isSubmitting
                                    ? 'bg-linear-to-r from-green-600 to-green-700 text-white hover:-translate-y-0.5'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {isSubmitting ? 'Отправка...' : 'Добавить в команду'}
                    </button>
                </div>

                {!hasAvailableStudents && canPick && (
                    <p className='mt-2 text-sm text-amber-600'>
                        Нет доступных студентов для добавления. Возможно, все уже распределены.
                    </p>
                )}
            </div>
        </div>
    );
};
