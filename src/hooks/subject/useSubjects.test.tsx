import { useSubjects } from './useSubjects';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Subject } from '@/types/subject/Subject';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from "react";
import { User as UserIcon } from 'lucide-react';

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

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
 * Calculates the progress percentage for a list of assignments.
 * Progress is determined by the number of completed assignments (with graded or reviewed submissions with a grade).
 * @param assignments Array of Assignment objects to calculate progress for.
 * @returns {number} Progress percentage (0-100).
 * @throws {Error} If assignments is not an array.
 */
function calculateProgress(assignments: Assignment[]): number {
    if (!Array.isArray(assignments)) {
        throw new Error('assignments must be an array');
    }
    if (assignments.length === 0) return 0;
    const completed = assignments.filter(a =>
        a.submissions.some(s =>
            ((s.status === 'Graded' || s.status === 'RequiresReview') && s.grade !== undefined)
        )
    ).length;
    return Math.round((completed / assignments.length) * 100);
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
        const progress = calculateProgress(subject.assignments);
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
        const progress = calculateProgress(subject.assignments);
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
        const progress = calculateProgress(subject.assignments);
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
        const { result } = renderHook(() => useSubjects(), { wrapper });
        act(() => {
            result.current.selectSubject({
                id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                title: 'Тест',
                description: 'Описание',
                code: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                progress: 0,
                students: 0,
                icon: UserIcon,
                color: 'bg-blue-500',
            });
        });
        expect(result.current.selectedSubject).toEqual({
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            title: 'Тест',
            description: 'Описание',
            code: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            progress: 0,
            students: 0,
            icon: UserIcon,
            color: 'bg-blue-500',
        });
    });
});

/**
 * Тесты бизнес-логики загрузки участников для каждой карточки предмета.
 * Проверяется корректность отправки запросов, обработки ответов и ошибок.
 */
describe('useSubjects — loading participants', () => {
    it('должен отправлять отдельный запрос к API участников для каждого subjectId', async () => {
        global.fetch = jest.fn().mockImplementation((...args) => {
            console.log('fetch called:', args[0]);
            return Promise.resolve({
                ok: true,
                json: async () => [{ userId: '1', username: 'User1', avatarUrl: '' }],
            });
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await result.current.loadParticipants('subject1');
            await result.current.loadParticipants('subject2');
        });
        const participantCalls = (global.fetch as jest.Mock).mock.calls.filter(
            ([url]) => url.includes('/participants')
        );
        expect(participantCalls).toHaveLength(2);
        expect(participantCalls[0][0]).toContain('/api/subjects/subject1/participants');
        expect(participantCalls[1][0]).toContain('/api/subjects/subject2/participants');
    });

    it('должен отправлять запрос с правильными параметрами limit и offset', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => [],
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await result.current.loadParticipants('subject1', 3, 0);
        });
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('limit=3'), expect.anything());
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('offset=0'), expect.anything());
    });

    it('должен сохранять участников при успешном ответе', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => [{ userId: '1', username: 'User1', avatarUrl: '' }],
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await result.current.loadParticipants('subject1');
        });
        expect(result.current.participants['subject1']).toEqual([{ userId: '1', username: 'User1', avatarUrl: '' }]);
    });

    it('должен не добавлять участников при пустом ответе', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => [],
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await result.current.loadParticipants('subject1');
        });
        expect(result.current.participants['subject1']).toEqual([]);
    });

    it('должен корректно обрабатывать ошибку 404', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 404,
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await expect(result.current.loadParticipants('subject1')).rejects.toThrow('Not found');
        });
    });

    it('должен корректно обрабатывать ошибку 401', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 401,
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await expect(result.current.loadParticipants('subject1')).rejects.toThrow('Unauthorized');
        });
    });

    it('должен корректно обрабатывать ошибку 403', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 403,
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await expect(result.current.loadParticipants('subject1')).rejects.toThrow('Forbidden');
        });
    });
});

/**
 * Тесты бизнес-логики загрузки заданий и решений для каждого предмета.
 * Проверяется корректность отправки запросов, обработки ответов и ошибок для assignments и submissions.
 */
describe('useSubjects — loading assignments', () => {
    it('должен отправлять отдельный запрос к API заданий для каждого subjectId', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => [{ id: 'assignment1' }, { id: 'assignment2' }],
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await result.current.loadAssignments('subject1', 10, 0);
            await result.current.loadAssignments('subject2', 10, 0);
        });
        const assignmentCalls = (global.fetch as jest.Mock).mock.calls.filter(
            ([url]) => url.includes('/assignments')
        );
        expect(assignmentCalls).toHaveLength(2);
        expect(assignmentCalls[0][0]).toContain('/api/subjects/subject1/assignments');
        expect(assignmentCalls[1][0]).toContain('/api/subjects/subject2/assignments');
    });

    it('должен отправлять запрос с правильными параметрами limit и offset', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => [],
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await result.current.loadAssignments('subject1', 5, 2);
        });
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('limit=5'), expect.anything());
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('offset=2'), expect.anything());
    });

    it('должен сохранять задания при успешном ответе', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => [{ id: 'assignment1' }],
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await result.current.loadAssignments('subject1');
        });
        expect(result.current.assignments['subject1']).toEqual([{ id: 'assignment1' }]);
    });

    it('должен корректно обрабатывать ошибку 404', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 404,
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await expect(result.current.loadAssignments('subject1')).rejects.toThrow('Not found');
        });
    });

    it('должен корректно обрабатывать ошибку 401', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 401,
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await expect(result.current.loadAssignments('subject1')).rejects.toThrow('Unauthorized');
        });
    });

    it('должен корректно обрабатывать ошибку 403', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 403,
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await expect(result.current.loadAssignments('subject1')).rejects.toThrow('Forbidden');
        });
    });
});

/**
 * Тесты бизнес-логики загрузки решений для каждого задания.
 * Проверяется корректность отправки запросов, обработки ответов и ошибок для submissions.
 */
describe('useSubjects — loading submissions', () => {
    it('должен отправлять отдельный запрос к API решений для каждого assignmentId', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => [{ id: 'submission1' }, { id: 'submission2' }],
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await result.current.loadSubmissions('assignment1', 10, 0, true);
            await result.current.loadSubmissions('assignment2', 10, 0, true);
        });
        const submissionCalls = (global.fetch as jest.Mock).mock.calls.filter(
            ([url]) => url.includes('/submissions')
        );
        expect(submissionCalls).toHaveLength(2);
        expect(submissionCalls[0][0]).toContain('/api/assignments/assignment1/submissions');
        expect(submissionCalls[1][0]).toContain('/api/assignments/assignment2/submissions');
    });

    it('должен отправлять запрос с правильными параметрами limit, offset и isTeacher', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => [],
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await result.current.loadSubmissions('assignment1', 5, 2, true);
        });
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('limit=5'), expect.anything());
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('offset=2'), expect.anything());
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('isTeacher=true'), expect.anything());
    });

    it('должен сохранять решения при успешном ответе', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => [{ id: 'submission1' }],
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await result.current.loadSubmissions('assignment1');
        });
        expect(result.current.submissions['assignment1']).toEqual([{ id: 'submission1' }]);
    });

    it('должен корректно обрабатывать ошибку 404', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 404,
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await expect(result.current.loadSubmissions('assignment1')).rejects.toThrow('Not found');
        });
    });

    it('должен корректно обрабатывать ошибку 401', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 401,
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await expect(result.current.loadSubmissions('assignment1')).rejects.toThrow('Unauthorized');
        });
    });

    it('должен корректно обрабатывать ошибку 403', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 403,
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await expect(result.current.loadSubmissions('assignment1')).rejects.toThrow('Forbidden');
        });
    });
});

/**
 * Тесты бизнес-логики пустого списка предметов и ошибок загрузки.
 * Проверяется корректное поведение хука useSubjects при отсутствии предметов и ошибках API.
 */
describe('useSubjects — empty and error states', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    
    it('должен возвращать пустой список предметов, если API возвращает пустой массив', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => [],
        });
        const queryClient = new QueryClient();
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.subjects).toEqual([]);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isError).toBe(false);
    });

    it('должен корректно обрабатывать ошибку 401 при загрузке предметов', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 401,
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await Promise.resolve();
        });
        await waitFor(() => {
            expect(result.current.isError).toBe(true);
            expect(result.current.error).toEqual(new Error('Unauthorized'));
        });
    });

    it('должен корректно обрабатывать ошибку 403 при загрузке предметов', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 403,
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await Promise.resolve();
        });
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toEqual(new Error('Ошибка загрузки предметов'));
    });

    it('должен корректно обрабатывать ошибку 500 при загрузке предметов', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 500,
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await Promise.resolve();
        });
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toEqual(new Error('Ошибка загрузки предметов'));
    });
});

/**
 * Тесты сложных кейсов расчёта прогресса.
 * Проверяется корректность расчёта при статусах RequiresReview без оценки и Draft с оценкой.
 */
describe('useSubjects — progress edge cases', () => {
    it('должен не учитывать RequiresReview без оценки в прогрессе', () => {
        const assignments: Assignment[] = [
            { id: 'a1', submissions: [{ status: 'RequiresReview', grade: undefined }] },
            { id: 'a2', submissions: [{ status: 'Graded', grade: { score: 5 } }] },
        ];
        const progress = calculateProgress(assignments);
        expect(progress).toBe(50);
    });

    it('должен не учитывать Draft с оценкой в прогрессе', () => {
        const assignments: Assignment[] = [
            { id: 'a1', submissions: [{ status: 'Draft', grade: { score: 5 } }] },
            { id: 'a2', submissions: [{ status: 'Graded', grade: { score: 5 } }] },
        ];
        const progress = calculateProgress(assignments);
        expect(progress).toBe(50);
    });
});

/**
 * Тесты сброса ошибок после успешной повторной загрузки.
 * Проверяется, что ошибка удаляется после успешного запроса.
 */
describe('useSubjects — error reset', () => {
    it('должен сбрасывать ошибку после успешной повторной загрузки участников', async () => {
        let fail = true;
        global.fetch = jest.fn().mockImplementation(() => {
            if (fail) {
                fail = false;
                return Promise.resolve({ ok: false, status: 404 });
            }
            return Promise.resolve({ ok: true, json: async () => [{ userId: '1', username: 'User1', avatarUrl: '' }] });
        });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await result.current.loadParticipants('subject1').catch(() => {});
            await result.current.loadParticipants('subject1');
        });
        expect(result.current.errorsParticipants['subject1']).toBeUndefined();
        expect(result.current.participants['subject1']).toEqual([{ userId: '1', username: 'User1', avatarUrl: '' }]);
    });
});

/**
 * Тесты повторного выбора и сброса выбранного предмета.
 * Проверяется корректность выбора и сброса.
 */
describe('useSubjects — subject re-selection', () => {
    it('должен корректно выбирать и сбрасывать выбранный предмет', () => {
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        act(() => {
            result.current.selectSubject({
                id: 'subject1',
                title: 'Тест',
                description: 'Описание',
                code: 'subject1',
                progress: 0,
                students: 0,
                icon: UserIcon,
                color: 'bg-blue-500',
            });
        });
        expect(result.current.selectedSubject).toEqual(expect.objectContaining({ id: 'subject1' }));
        act(() => {
            result.current.selectSubject({
                id: '',
                title: '',
                description: '',
                code: '',
                progress: 0,
                students: 0,
                icon: UserIcon,
                color: '',
            });
        });
        expect(result.current.selectedSubject).toEqual(expect.objectContaining({ id: '' }));
    });
});

/**
 * Тесты пагинации для участников, заданий и решений.
 * Проверяется корректная работа limit/offset.
 */
describe('useSubjects — pagination', () => {
    it('должен корректно передавать limit и offset при загрузке участников', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await result.current.loadParticipants('subject1', 5, 2);
        });
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('limit=5'), expect.anything());
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('offset=2'), expect.anything());
    });
    it('должен корректно передавать limit и offset при загрузке заданий', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await result.current.loadAssignments('subject1', 3, 1);
        });
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('limit=3'), expect.anything());
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('offset=1'), expect.anything());
    });
    it('должен корректно передавать limit, offset и isTeacher при загрузке решений', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
        const { result } = renderHook(() => useSubjects(false), { wrapper });
        await act(async () => {
            await result.current.loadSubmissions('assignment1', 2, 0, true);
        });
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('limit=2'), expect.anything());
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('offset=0'), expect.anything());
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('isTeacher=true'), expect.anything());
    });
});

/**
 * Тесты автоматической загрузки участников, заданий и решений при autoLoadParticipants=true.
 * Проверяется, что данные загружаются автоматически при монтировании.
 */
describe('useSubjects — auto loading', () => {
    it('должен автоматически загружать участников, задания и решения при autoLoadParticipants=true', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
        renderHook(() => useSubjects(true), { wrapper });
        await act(async () => {
            await Promise.resolve();
        });
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/participants'), expect.anything());
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/assignments'), expect.anything());
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/submissions'), expect.anything());
    });
});
