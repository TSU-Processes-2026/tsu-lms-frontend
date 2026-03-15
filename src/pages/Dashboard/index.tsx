import { SubjectCard } from '@/components/ui/SubjectCard';
import { useSubjects, ExtendedSubject } from '@/hooks/subject/useSubjects';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
    const { subjects, selectSubject, participants, isLoading, isError, error, errorsParticipants } =
        useSubjects();
    const navigate = useNavigate();

    const onSelectSubject = (subject: ExtendedSubject) => {
        selectSubject(subject);
        navigate(`/subjects/${subject.id}`);
    };
    return (
        <div className='max-w-6xl mx-auto'>
            <div className='mb-8'>
                <h3 className='text-2xl font-bold text-slate-800'>Ваши предметы</h3>
                <p className='text-slate-500 text-sm mt-1'>
                    Здесь отображены предметы, в которых вы являетесь админом. Выберите предмет для
                    перехода
                </p>
            </div>
            {isLoading ? (
                <div data-testid='subjects-skeleton'>Загрузка...</div>
            ) : isError || error ? (
                <div data-testid='subjects-error'>
                    Ошибка:{' '}
                    {error instanceof Error ? error.message : 'Не удалось загрузить предметы'}
                </div>
            ) : subjects && subjects.length === 0 ? (
                <div data-testid='subjects-empty'>Нет предметов</div>
            ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {subjects.map((subject) => (
                        <SubjectCard
                            key={subject.id}
                            subject={subject}
                            onSelect={onSelectSubject}
                            participants={participants[subject.id] || []}
                            participantsError={errorsParticipants[subject.id]}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
