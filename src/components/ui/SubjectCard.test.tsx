import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SubjectCard } from '@/components/SubjectCard';

/**
 * Tests for dynamic progress calculation in SubjectCard using LMS OpenAPI DTOs.
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
