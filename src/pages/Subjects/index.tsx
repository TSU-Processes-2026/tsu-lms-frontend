import React, { JSX } from 'react';
import { SubjectCard } from '@/components/ui/SubjectCard';
import { useSubjects } from '@/hooks/subject/useSubjects';

export const SubjectsPage: React.FC = (): JSX.Element => {
    const { subjects, selectSubject, participants, isLoading, isError, error, errorsParticipants } = useSubjects();

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-800">Все предметы</h3>
                <p className="text-slate-500 text-sm mt-1">Выберите предмет для просмотра материалов</p>
            </div>
            {isLoading && (
                <div data-testid="subjects-skeleton">Загрузка...</div>
            )}
            {isError && (
                <div data-testid="subjects-error">Ошибка: {error instanceof Error ? error.message : 'Не удалось загрузить предметы'}</div>
            )}
            {!isLoading && !isError && subjects.length === 0 && (
                <div data-testid="subjects-empty">Нет предметов</div>
            )}
            {!isLoading && !isError && subjects.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subject) => (
                        <SubjectCard
                            key={subject.id}
                            subject={subject}
                            onSelect={selectSubject}
                            participants={participants[subject.id] || []}
                            participantsError={errorsParticipants[subject.id]}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
