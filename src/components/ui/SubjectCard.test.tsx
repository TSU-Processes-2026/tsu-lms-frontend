import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SubjectCard from './SubjectCard';

/**
 * Тесты отображения мини-аватарок участников.
 * Проверяется лимит отображения аватарок.
 */
describe('SubjectCard — avatars', () => {
    it('должен отображать не более 3 мини-аватарок участников', () => {
        const participants = [
            { userId: '1', username: 'Пользователь 1', avatarUrl: 'url1' },
            { userId: '2', username: 'Пользователь 2', avatarUrl: 'url2' },
            { userId: '3', username: 'Пользователь 3', avatarUrl: 'url3' },
            { userId: '4', username: 'Пользователь 4', avatarUrl: 'url4' },
        ];
        render(<SubjectCard participants={participants} />);
        expect(screen.getAllByTestId('avatar')).toHaveLength(3);
    });
});

/**
 * Тесты отображения бейджа с количеством остальных участников.
 * Проверяется корректный подсчёт и отображение бейджа.
 */
describe('SubjectCard — badge', () => {
    it('должен корректно отображать бейдж с количеством остальных участников', () => {
        const participants = [
            { userId: '1', username: 'Пользователь 1', avatarUrl: 'url1' },
            { userId: '2', username: 'Пользователь 2', avatarUrl: 'url2' },
            { userId: '3', username: 'Пользователь 3', avatarUrl: 'url3' },
            { userId: '4', username: 'Пользователь 4', avatarUrl: 'url4' },
            { userId: '5', username: 'Пользователь 5', avatarUrl: 'url5' },
        ];
        render(<SubjectCard participants={participants} />);
        expect(screen.getByTestId('badge')).toHaveTextContent('+2');
    });

    it('должен не отображать бейдж, если участников меньше лимита', () => {
        const participants = [
            { userId: '1', username: 'Пользователь 1', avatarUrl: 'url1' },
            { userId: '2', username: 'Пользователь 2', avatarUrl: 'url2' },
        ];
        render(<SubjectCard participants={participants} />);
        expect(screen.queryByTestId('badge')).toBeNull();
    });

    it('должен не отображать бейдж, если участников ровно лимит', () => {
        const participants = [
            { userId: '1', username: 'Пользователь 1', avatarUrl: 'url1' },
            { userId: '2', username: 'Пользователь 2', avatarUrl: 'url2' },
            { userId: '3', username: 'Пользователь 3', avatarUrl: 'url3' },
        ];
        render(<SubjectCard participants={participants} />);
        expect(screen.queryByTestId('badge')).toBeNull();
    });

    it('должен отображать бейдж с правильным числом, если участников больше лимита', () => {
        const participants = [
            { userId: '1', username: 'Пользователь 1', avatarUrl: 'url1' },
            { userId: '2', username: 'Пользователь 2', avatarUrl: 'url2' },
            { userId: '3', username: 'Пользователь 3', avatarUrl: 'url3' },
            { userId: '4', username: 'Пользователь 4', avatarUrl: 'url4' },
            { userId: '5', username: 'Пользователь 5', avatarUrl: 'url5' },
            { userId: '6', username: 'Пользователь 6', avatarUrl: 'url6' },
        ];
        render(<SubjectCard participants={participants} />);
        expect(screen.getByTestId('badge')).toHaveTextContent('+3');
    });
});
