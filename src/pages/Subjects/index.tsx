import { SubjectCard } from '@/components/ui/SubjectCard';
import { useSubjects } from '@/hooks/subject/useSubjects';
import { useNavigate, useParams } from 'react-router-dom';
import { ExtendedSubject } from '@/hooks/subject/useSubjects';
import SubjectView from '../SubjectView';

const SubjectsPage = () => {
    const { subjects, selectSubject, participants, isLoading, isError, error, errorsParticipants } = useSubjects();
    const navigate = useNavigate();
    const { subjectId } = useParams();

    const onSelectSubject = (subject: ExtendedSubject) => {
        selectSubject(subject);
        navigate(`/subjects/${subject.id}`);
    };

    if (subjectId) {
        return <SubjectView />;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-800">Все предметы</h3>
                <p className="text-slate-500 text-sm mt-1">Выберите предмет для просмотра материалов</p>
            </div>
            {isLoading ? (
                <div data-testid="subjects-skeleton">Загрузка...</div>
            ) : (isError || error) ? (
                <div data-testid="subjects-error">Ошибка: {error instanceof Error ? error.message : 'Не удалось загрузить предметы'}</div>
            ) : (subjects && subjects.length === 0) ? (
                <div data-testid="subjects-empty">Нет предметов</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

export { SubjectsPage };
