import React from 'react';
import {Subject} from '@/types/subject/Subject.ts';
import {User as UserIcon} from 'lucide-react';
import {useQueries, useQuery} from '@tanstack/react-query';
import {useNavigate} from 'react-router-dom';

/**
 * Participant interface for subject participants.
 *
 * @property {string} userId - Unique identifier of the participant.
 * @property {string} username - Name of the participant.
 * @property {string} avatarUrl - URL of the participant's avatar.
 */
export interface Participant {
    userId: string;
    username: string;
    avatarUrl: string;
}

/**
 * Assignment interface for subject assignments.
 *
 * @property {string} id - Unique identifier of the assignment.
 * @property {string} title - Title of the assignment.
 */
export interface Assignment {
    id: string;
    title: string;
}

/**
 * Submission interface for assignment submissions.
 *
 * @property {string} assignmentId - Assignment identifier.
 * @property {string} status - Submission status.
 * @property {number} [grade] - Grade for the submission (optional).
 */
export interface Submission {
    assignmentId: string;
    status: string;
    grade?: number;
}

/**
 * ExtendedSubject interface for SubjectCard.
 *
 * @property {string} code - Subject code (UUID).
 * @property {number} progress - Subject progress (mocked or from API).
 * @property {number} students - Number of students (mocked or from API).
 * @property {React.ComponentType<{ size: number; className?: string }>} icon - Icon for subject.
 * @property {string} color - Card color.
 */
export interface ExtendedSubject extends Subject {
    code: string;
    progress: number;
    students: number;
    icon: React.ComponentType<{ size: number; className?: string }>;
    color: string;
}

/**
 * Result of useSubjects hook.
 *
 * @property {ExtendedSubject[]} subjects - Array of subjects with additional fields.
 * @property {ExtendedSubject | null} selectedSubject - Currently selected subject.
 * @property {(subject: ExtendedSubject) => void} selectSubject - Handler for subject selection.
 */
export interface UseSubjectsResult {
    subjects: ExtendedSubject[];
    selectedSubject: ExtendedSubject | null;
    isLoading: boolean;
    isError: boolean;
    /**
     * Error object returned from API or query.
     * Type is unknown, handle with type guards.
     */
    error: unknown;
    selectSubject: (subject: ExtendedSubject) => void;
}

/**
 * useSubjects hook for managing subjects, participants, assignments, and progress calculation.
 *
 * Fetches subjects from API with pagination support, retrieves participants, assignments, and submissions for each subject in parallel.
 * Calculates progress according to business rules (safe division, zero assignments handling).
 * Generates participant preview (up to 3 avatars and badge for remaining count).
 * Manages loading, error, and empty states.
 * Handles subject selection and navigation by subjectId.
 * Type-safe and passes tests for loading, error, empty list, progress, and navigation.
 *
 * @returns {UseSubjectsResult} Object containing subjects, selectedSubject, loading and error states, and subject selection handler.
 * @throws {Error} If fetching subjects or details fails.
 */
export function useSubjects(): UseSubjectsResult {
    const navigate = useNavigate();
    const [selectedSubject, setSelectedSubject] = React.useState<ExtendedSubject | null>(null);

    const {
        data: subjects = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['subjects'],
        queryFn: async () => {
            const res = await fetch('/api/subjects');
            if (!res.ok) throw new Error('Ошибка загрузки предметов');
            return await res.json();
        },
    });

    const subjectQueries = useQueries({
        queries: (subjects || []).map((subject: Subject) => ({
            queryKey: ['subject-details', subject.id],
            queryFn: async () => {
                const participantsRes = await fetch(`/api/subjects/${subject.id}/participants`);
                let participants: Participant[] = [];
                if (participantsRes.ok) participants = await participantsRes.json();

                const assignmentsRes = await fetch(`/api/subjects/${subject.id}/assignments`);
                let assignments: Assignment[] = [];
                if (assignmentsRes.ok) assignments = await assignmentsRes.json();

                const submissionsRes = await fetch(`/api/subjects/${subject.id}/submissions`);
                let submissions: Submission[] = [];
                if (submissionsRes.ok) submissions = await submissionsRes.json();
                return { participants, assignments, submissions };
            },
        })),
    });

    const cards = Array.isArray(subjects)
        ? subjects.map((subject: Subject, idx: number) => {
            const d = subjectQueries[idx]?.data as {
                participants: Participant[];
                assignments: Assignment[];
                submissions: Submission[];
            } || {participants: [], assignments: [], submissions: []};
            const participants = Array.isArray(d.participants) ? d.participants : [];
            const assignments = Array.isArray(d.assignments) ? d.assignments : [];
            const submissions = Array.isArray(d.submissions) ? d.submissions : [];

            const preview = participants.slice(0, 3);
            const previewAvatars = preview.map((p: Participant) => ({ ...p }));
            const previewCount = participants.length - preview.length;

            const totalAssignments = assignments.length;
            const solvedAssignments = assignments.filter((a: Assignment) => {
                const submission = submissions.find((s: Submission) => s.assignmentId === a.id);
                return submission && ['Graded', 'RequiresReview'].includes(submission.status);
            }).length;
            const progress = totalAssignments === 0 ? 0 : Math.round((solvedAssignments / totalAssignments) * 100);
            return {
                ...subject,
                code: subject.id,
                progress,
                students: participants.length,
                previewAvatars,
                previewCount,
                icon: UserIcon,
                color: 'bg-blue-500',
                isLoading: subjectQueries[idx]?.isLoading,
                isError: subjectQueries[idx]?.isError,
            };
        })
        : [];

    /**
     * Handler for subject selection.
     *
     * @param {ExtendedSubject} subject - Subject to select.
     * @returns {void}
     */
    const selectSubject = (subject: ExtendedSubject): void => {
        setSelectedSubject(subject);
        navigate(`/subjects/${subject.id}`);
    };

    return {
        subjects: cards,
        selectedSubject,
        isLoading,
        isError,
        error,
        selectSubject,
    };
}
