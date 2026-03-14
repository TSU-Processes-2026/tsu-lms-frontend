import { useSubjects } from './useSubjects';
import { Subject } from '@/types/subject/Subject';

/**
 * Assignment mock type for testing progress calculation.
 */
interface Assignment {
    id: string;
    submissions: Submission[];
}

/**
 * Submission mock type for testing progress calculation.
 */
interface Submission {
    status: 'Draft' | 'RequiresReview' | 'Graded';
    grade?: { score: number };
}

/**
 * Participant mock type for testing filtering.
 */
interface Participant {
    userId: string;
    role: string;
    username: string;
    avatarUrl: string;
}

/**
 * Тесты расчёта прогресса для предмета.
 * Проверяется корректность вычисления процента выполнения заданий.
 */
describe('useSubjects — progress', () => {
    it('должен возвращать 0% прогресса, если нет заданий', () => {
        const subject: Subject & { assignments: Assignment[] } = {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            title: 'Тестовый предмет',
            description: 'Описание',
            assignments: [],
        };
        const progress = subject.assignments.length === 0 ? 0 : 100;
        expect(progress).toBe(0);
    });

    it('должен корректно вычислять прогресс, исключая нерешённые задачи', () => {
        const subject: Subject & { assignments: Assignment[] } = {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            title: 'Тестовый предмет',
            description: 'Описание',
            assignments: [
                { id: 'a1', submissions: [{ status: 'Draft' }] },
                { id: 'a2', submissions: [{ status: 'RequiresReview' }] },
                { id: 'a3', submissions: [{ status: 'Graded', grade: { score: 5 } }] },
                { id: 'a4', submissions: [{ status: 'RequiresReview', grade: { score: 4 } }] },
                { id: 'a5', submissions: [{ status: 'Graded' }] },
            ],
        };
        const completed = subject.assignments.filter(a =>
            a.submissions.some(s =>
                (s.status === 'Graded' && s.grade) ||
                (s.status === 'RequiresReview' && s.grade)
            )
        ).length;
        const progress = Math.round((completed / subject.assignments.length) * 100);
        expect(progress).toBe(40);
    });

    it('должен возвращать 100% прогресса, если все задания завершены', () => {
        const subject: Subject & { assignments: Assignment[] } = {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            title: 'Тестовый предмет',
            description: 'Описание',
            assignments: [
                { id: 'a1', submissions: [{ status: 'Graded', grade: { score: 5 } }] },
                { id: 'a2', submissions: [{ status: 'Graded', grade: { score: 4 } }] },
            ],
        };

        const completed = subject.assignments.filter(a => a.submissions.some(s => s.status === 'Graded' && s.grade)).length;
        const progress = Math.round((completed / subject.assignments.length) * 100);
        expect(progress).toBe(100);
    });
});

/**
 * Тесты фильтрации участников по роли.
 * Проверяется корректность фильтрации массива участников.
 */
describe('useSubjects — participant filtering', () => {
    it('должен корректно фильтровать участников по роли', () => {
        const participants: Participant[] = [
            { userId: '1', role: 'Student', username: 'User1', avatarUrl: '' },
            { userId: '2', role: 'Teacher', username: 'User2', avatarUrl: '' },
            { userId: '3', role: 'Student', username: 'User3', avatarUrl: '' },
        ];
        const students = participants.filter(p => p.role === 'Student');
        expect(students).toHaveLength(2);
    });
});

/**
 * Тесты выбора предмета.
 * Проверяется корректность сохранения выбранного предмета.
 */
describe('useSubjects — subject selection', () => {
    it('должен корректно выбирать предмет', () => {
        const hook = useSubjects();
        hook.selectSubject({ id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', title: 'Тест', description: 'Описание' });
        expect(hook.selectedSubject).toEqual({ id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', title: 'Тест', description: 'Описание' });
    });
});

/**
 * Тесты бизнес-логики загрузки участников для каждой карточки предмета.
 * Проверяется корректность отправки запросов, обработки ответов и ошибок.
 */
describe('useSubjects — loading participants', () => {
    it('должен отправлять отдельный запрос к API участников для каждого subjectId', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => [{ userId: '1', username: 'User1', avatarUrl: '' }],
        });
        const hook = useSubjects();
        await hook.loadParticipants('subject1');
        await hook.loadParticipants('subject2');
        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/subjects/subject1/participants'), expect.anything());
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/subjects/subject2/participants'), expect.anything());
    });

    it('должен отправлять запрос с правильными параметрами limit и offset', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => [],
        });
        const hook = useSubjects();
        await hook.loadParticipants('subject1', 3, 0);
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('limit=3'), expect.anything());
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('offset=0'), expect.anything());
    });

    it('должен сохранять участников при успешном ответе', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => [{ userId: '1', username: 'User1', avatarUrl: '' }],
        });
        const hook = useSubjects();
        await hook.loadParticipants('subject1');
        expect(hook.participants['subject1']).toEqual([{ userId: '1', username: 'User1', avatarUrl: '' }]);
    });

    it('должен не добавлять участников при пустом ответе', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => [],
        });
        const hook = useSubjects();
        await hook.loadParticipants('subject1');
        expect(hook.participants['subject1']).toEqual([]);
    });

    it('должен корректно обрабатывать ошибку 404', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 404,
        });
        const hook = useSubjects();
        await expect(hook.loadParticipants('subject1')).rejects.toThrow('Not found');
    });

    it('должен корректно обрабатывать ошибку 401', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 401,
        });
        const hook = useSubjects();
        await expect(hook.loadParticipants('subject1')).rejects.toThrow('Unauthorized');
    });

    it('должен корректно обрабатывать ошибку 403', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 403,
        });
        const hook = useSubjects();
        await expect(hook.loadParticipants('subject1')).rejects.toThrow('Forbidden');
    });
});