import React, { JSX } from 'react';
import { SubjectCard } from '@/components/ui/SubjectCard';
import { Subject } from '@/types/subject/Subject';
import { useSubjects } from '@/hooks/subject/useSubjects';

export const SubjectsPage: React.FC = (): JSX.Element => {
    const { subjects, selectSubject } = useSubjects();
    const mapSubjectToCard = (subject: Subject) => ({
        ...subject,
        icon: () => <span>📚</span>,
        color: 'bg-blue-500',
        code: subject.id,
        progress: Math.floor(Math.random() * 100),
        students: Math.floor(Math.random() * 20) + 3,
    });

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-800">Все предметы</h3>
                <p className="text-slate-500 text-sm mt-1">Выберите предмет для просмотра материалов</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => (
                    <SubjectCard key={subject.id} subject={mapSubjectToCard(subject)} onSelect={selectSubject} />
                ))}
            </div>
        </div>
    );
};
