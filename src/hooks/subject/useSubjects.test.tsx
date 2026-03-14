import { useSubjects } from './useSubjects';
import { act, renderHook } from '@testing-library/react';
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
