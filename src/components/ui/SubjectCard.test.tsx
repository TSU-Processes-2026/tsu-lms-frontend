import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SubjectCard } from '@/components/SubjectCard';

/**
 * Tests for dynamic progress calculation in SubjectCard.
 *
 * These tests verify that:
 * 1. The progress bar correctly calculates the completion percentage based on assignments and submissions with grades.
 * 2. Only assignments with at least one submission in status 'Graded' and с оценкой учитываются как завершённые.
 * 3. Draft, RequiresReview, или без оценки не учитываются в прогрессе.
 */
describe('SubjectCard - Progress Calculation', () => {
    const baseSubject = {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        title: 'Проектирование архитектуры ПО',
        description: 'Курс по UML и паттернам проектирования',
    };

    it('should show 0% progress if there are no assignments', () => {
        render(
            <SubjectCard subject={{ ...baseSubject, assignments: [] }} onSelect={() => {}} />
        );
        expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should show 100% progress if all assignments have at least one graded submission', () => {
        const assignments = [
            { id: 'a1', submissions: [{ status: 'Graded', grade: { score: 5 } }] },
            { id: 'a2', submissions: [{ status: 'Graded', grade: { score: 4 } }] },
        ];
        render(
            <SubjectCard subject={{ ...baseSubject, assignments }} onSelect={() => {}} />
        );
        expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should not count assignments with only draft or requires review submissions', () => {
        const assignments = [
            { id: 'a1', submissions: [{ status: 'Graded', grade: { score: 5 } }] },
            { id: 'a2', submissions: [{ status: 'Draft' }] },
            { id: 'a3', submissions: [{ status: 'RequiresReview' }] },
        ];
        render(
            <SubjectCard subject={{ ...baseSubject, assignments }} onSelect={() => {}} />
        );
        expect(screen.getByText('33%')).toBeInTheDocument();
    });

    it('should not count assignments with only graded submissions but no grade object', () => {
        const assignments = [
            { id: 'a1', submissions: [{ status: 'Graded', grade: { score: 5 } }] },
            { id: 'a2', submissions: [{ status: 'Graded' }] },
        ];
        render(
            <SubjectCard subject={{ ...baseSubject, assignments }} onSelect={() => {}} />
        );
        expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should round down the progress percentage', () => {
        const assignments = [
            { id: 'a1', submissions: [{ status: 'Graded', grade: { score: 5 } }] },
            { id: 'a2', submissions: [{ status: 'Graded', grade: { score: 4 } }] },
            { id: 'a3', submissions: [] },
            { id: 'a4', submissions: [{ status: 'Draft' }] },
            { id: 'a5', submissions: [{ status: 'RequiresReview' }] },
        ];
        render(
            <SubjectCard subject={{ ...baseSubject, assignments }} onSelect={() => {}} />
        );
        expect(screen.getByText('40%')).toBeInTheDocument();
    });

    it('should count assignment as completed if at least one submission is graded and has grade', () => {
        const assignments = [
            { id: 'a1', submissions: [
                { status: 'Draft' },
                { status: 'Graded', grade: { score: 5 } },
                { status: 'RequiresReview' },
            ] },
            { id: 'a2', submissions: [{ status: 'Graded', grade: { score: 4 } }] },
        ];
        render(
            <SubjectCard subject={{ ...baseSubject, assignments }} onSelect={() => {}} />
        );
        expect(screen.getByText('100%')).toBeInTheDocument();
    });
});

/**
 * Tests for rendering the participants block in SubjectCard.
 *
 * These tests verify:
 * 1. Correct loading and rendering of the participants list for each card.
 * 2. Rendering of a limited number of mini-avatars.
 * 3. Accurate calculation and rendering of the badge with the number of remaining participants.
 *
 * @param participants Array of participants for the subject.
 * @param avatarLimit Maximum number of avatars to display.
 * @returns void
 * @throws None
 */
describe('SubjectCard - Participants Block', () => {
    const AVATAR_LIMIT = 3;
    const mockParticipants = Array.from({ length: 24 }, (_, i) => ({
        userId: `00000000-0000-0000-0000-0000000000${i + 1}`,
        role: 'Student',
        username: `User${i + 1}`,
        avatarUrl: `https://example.com/avatar${i + 1}.png`,
    }));
    const baseSubject = {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        title: 'Проектирование архитектуры ПО',
        description: 'Курс по UML и паттернам проектирования',
    };

    it('renders only the limited number of mini-avatars', async () => {
        render(
            <SubjectCard subject={baseSubject} participants={mockParticipants} avatarLimit={AVATAR_LIMIT} onSelect={() => {}} />
        );
        expect(screen.getAllByTestId('participant-avatar')).toHaveLength(AVATAR_LIMIT);
    });

    it('renders badge with correct number of remaining participants', async () => {
        render(
            <SubjectCard subject={baseSubject} participants={mockParticipants} avatarLimit={AVATAR_LIMIT} onSelect={() => {}} />
        );
        expect(screen.getByTestId('participants-badge')).toHaveTextContent('+21');
    });

    it('does not render badge if participants count does not exceed limit', async () => {
        const fewParticipants = mockParticipants.slice(0, 2);
        render(
            <SubjectCard subject={baseSubject} participants={fewParticipants} avatarLimit={AVATAR_LIMIT} onSelect={() => {}} />
        );
        expect(screen.queryByTestId('participants-badge')).toBeNull();
    });

    it('renders correct avatars and badge for each subject card independently', async () => {
        const subjects = [
            { ...baseSubject, id: '1', title: 'Math' },
            { ...baseSubject, id: '2', title: 'Physics' }
        ];
        const participantsList = [mockParticipants, mockParticipants.slice(0, 5)];
        render(
            <>
                <SubjectCard subject={subjects[0]} participants={participantsList[0]} avatarLimit={AVATAR_LIMIT} onSelect={() => {}} />
                <SubjectCard subject={subjects[1]} participants={participantsList[1]} avatarLimit={AVATAR_LIMIT} onSelect={() => {}} />
            </>
        );
        expect(screen.getAllByTestId('participant-avatar').length).toBe(AVATAR_LIMIT * 2);
        expect(screen.getAllByTestId('participants-badge')[0]).toHaveTextContent('+21');
        expect(screen.getAllByTestId('participants-badge')[1]).toHaveTextContent('+2');
    });

    it('loads and renders participants asynchronously', async () => {
        render(
            <SubjectCard subject={baseSubject} avatarLimit={AVATAR_LIMIT} onSelect={() => {}} />
        );
        await waitFor(() => expect(screen.getAllByTestId('participant-avatar').length).toBeLessThanOrEqual(AVATAR_LIMIT));
    });
});
