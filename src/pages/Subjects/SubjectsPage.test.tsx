import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SubjectsPage } from "@/pages/Subjects/index.tsx";
import { useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from "react";

const queryClient = new QueryClient();

function renderWithProvider(ui: React.ReactElement) {
    return render(
        <QueryClientProvider client={queryClient}>
            {ui}
        </QueryClientProvider>
    );
}

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
        const urlString = String(url);
        if (urlString.match(/\/api\/subjects(\?.*)?$/)) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([
                    {
                        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        title: 'Mathematics',
                        description: 'Algebra and Geometry',
                    },
                    {
                        id: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
                        title: 'Physics',
                        description: 'Mechanics and Optics',
                    },
                ]),
            } as Response);
        }
        if (urlString.match(/\/api\/subjects\/.{36}\/participants/)) {
            const match = urlString.match(/\/api\/subjects\/(.{36})\/participants/);
            const subjectId = match ? match[1] : '';
            if (subjectId === '3fa85f64-5717-4562-b3fc-2c963f66afa6') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([
                        { userId: 'u1', role: 'Student' },
                        { userId: 'u2', role: 'Teacher' },
                    ]),
                } as Response);
            }
            if (subjectId === '4fa85f64-5717-4562-b3fc-2c963f66afa7') {
                return Promise.resolve({
                    ok: false,
                    status: 500,
                    json: () => Promise.resolve({ title: 'Internal Server Error' }),
                } as Response);
            }
        }
        return Promise.reject(new Error('Unknown endpoint'));
    });
});

afterEach(() => {
    jest.restoreAllMocks();
});

/**
 * Тесты запросов к API и обработки ответов.
 * Проверяется корректность отправки запросов и обработки успешных/ошибочных ответов.
 */
describe('SubjectsPage — API', () => {
    it('должен отправлять запрос к API для получения списка предметов при монтировании', async () => {
        renderWithProvider(<SubjectsPage />);
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/subjects'),
                expect.any(Object)
            );
        });
    });
    it('должен корректно обрабатывать частичную недоступность данных (ошибка загрузки участников для одной карточки)', async () => {
        renderWithProvider(<SubjectsPage />);
        expect(await screen.findByTestId('participant-avatar-u1')).toBeInTheDocument();
        expect(await screen.findByTestId('participants-error-4fa85f64-5717-4562-b3fc-2c963f66afa7')).toBeInTheDocument();
    });
});

/**
 * Тесты отображения карточек, описаний, скелетов и состояния "пусто".
 * Проверяется корректность визуального отображения элементов страницы.
 */
describe('SubjectsPage — rendering', () => {
    it('должен корректно отображать сетку карточек предметов после успешного ответа', async () => {
        renderWithProvider(<SubjectsPage />);
        expect(await screen.findByText('Mathematics')).toBeInTheDocument();
        expect(screen.getByText('Physics')).toBeInTheDocument();
    });
    it('должен отображать описание предмета под названием в карточке', async () => {
        renderWithProvider(<SubjectsPage />);
        expect(await screen.findByText('Algebra and Geometry')).toBeInTheDocument();
        expect(screen.getByText('Mechanics and Optics')).toBeInTheDocument();
    });
});

/**
 * Тесты отображения состояния загрузки (скелетонов).
 * Проверяется корректность отображения скелетонов во время ожидания ответа от сервера.
 */
describe('SubjectsPage — loading state', () => {
    it('должен отображать скелеты загрузки во время ожидания ответа от сервера', async () => {
        jest.spyOn(global, 'fetch').mockImplementationOnce(() => new Promise(() => {}));
        renderWithProvider(<SubjectsPage />);
        expect(screen.getByTestId('subjects-skeleton')).toBeInTheDocument();
    });
});

/**
 * Тесты отображения состояния пустого списка.
 * Проверяется корректность отображения заглушки при отсутствии предметов.
 */
describe('SubjectsPage — empty state', () => {
    it('должен показывать состояние "пусто", если предметы отсутствуют', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve([]),
        } as Response);
        renderWithProvider(<SubjectsPage />);
        expect(await screen.findByTestId('subjects-empty')).toBeInTheDocument();
    });
});

/**
 * Тесты обработки ошибок сети и частичной недоступности данных.
 * Проверяется корректность отображения ошибок и поведения интерфейса.
 */
describe('SubjectsPage — error handling', () => {
    it('должен показывать состояние ошибки при сетевых ошибках (например, 401 Unauthorized)', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ title: 'Unauthorized' }),
        } as Response);
        renderWithProvider(<SubjectsPage />);
        expect(await screen.findByTestId('subjects-error')).toBeInTheDocument();
        expect(screen.getByText(/unauthorized/i)).toBeInTheDocument();
    });
    it('должен корректно обрабатывать частичную недоступность данных (ошибка загрузки участников для одной карточки)', async () => {
        renderWithProvider(<SubjectsPage />);
        expect(await screen.findByTestId('participant-avatar-u1')).toBeInTheDocument();
        expect(await screen.findByTestId('participants-error-4fa85f64-5717-4562-b3fc-2c963f66afa7')).toBeInTheDocument();
    });
});

/**
 * Тесты безопасного вычисления прогресса.
 * Проверяется отсутствие ошибки деления на ноль и корректное отображение процента.
 */
describe('SubjectsPage — progress calculation', () => {
    it('должен безопасно рассчитывать прогресс для предметов без заданий (отображение 0% или 100%)', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve([
                { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', title: 'Math', description: 'Algebra', assignments: [] },
            ]),
        } as Response);
        renderWithProvider(<SubjectsPage />);
        expect(await screen.findByTestId('subject-progress-3fa85f64-5717-4562-b3fc-2c963f66afa6')).toHaveTextContent(/0%|100%/);
    });
});

/**
 * Тесты перехода на страницу деталей предмета.
 * Проверяется корректность навигации по UUID.
 */
describe('SubjectsPage — navigation', () => {
    it('должен переходить на страницу деталей предмета с правильным UUID при клике на карточку', async () => {
        const mockNavigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
        renderWithProvider(<SubjectsPage />);
        const card = await screen.findByTestId('subject-card-3fa85f64-5717-4562-b3fc-2c963f66afa6');
        card.click();
        expect(mockNavigate).toHaveBeenCalledWith('/subjects/3fa85f64-5717-4562-b3fc-2c963f66afa6');
    });
});
