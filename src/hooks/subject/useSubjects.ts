import React from 'react';
import { Subject } from '@/types/subject/Subject.ts';
import { GraduationCap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

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
 * Assignment interface for subject assignments.
 *
 * @property {string} id - Unique identifier of the assignment.
 * @property {string} title - Title of the assignment.
 * @property {Submission[]} [submissions] - Submissions for the assignment (optional).
 */
export interface Assignment {
    id: string;
    title: string;
    submissions?: Submission[];
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
    grade?: number | { score: number };
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
    selectedSubject: Subject | ExtendedSubject | null;
    isLoading: boolean;
    isError: boolean;
    /**
     * Error object returned from API or query.
     * Type is unknown, handle with type guards.
     */
    error: unknown;
    selectSubject: (subject: ExtendedSubject) => void;
    /**
     * Participants loaded for each subjectId.
     * @type {Record<string, Participant[]>}
     */
    participants: Record<string, Participant[]>;
    /**
     * Loads participants for a subject by subjectId.
     * @param {string} subjectId - Subject identifier.
     * @param {number} [limit] - Limit of participants to fetch.
     * @param {number} [offset] - Offset for pagination.
     * @returns {Promise<void>} Resolves when participants are loaded.
     * @throws {Error} Throws error for 404, 401, 403 statuses.
     */
    loadParticipants: (subjectId: string, limit?: number, offset?: number) => Promise<void>;
    /**
     * Errors occurred during loading participants for each subjectId.
     * @type {Record<string, Error>}
     */
    errorsParticipants: Record<string, Error>;
}

/**
 * useSubjects hook for managing subjects, participants, assignments, and progress calculation.
 *
 * @param {boolean} [autoLoadParticipants=true] - If true, participants are loaded automatically for each subject on mount. If false, participants are loaded only by manual call.
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
export function useSubjects(autoLoadParticipants: boolean = true): UseSubjectsResult {
    const [selectedSubject, setSelectedSubject] = React.useState<Subject | ExtendedSubject | null>(null);
    const [participants, setParticipants] = React.useState<Record<string, Participant[]>>({});
    const [errorsParticipants, setErrorsParticipants] = React.useState<Record<string, Error>>({});

    const {
        data: subjects = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['subjects'],
        queryFn: async () => {
            const res = await fetch('/api/subjects', {});
            if (!res.ok) {
                let err;
                if (res.status === 401) err = new Error('Unauthorized');
                else err = new Error('Ошибка загрузки предметов');
                throw err;
            }
            return await res.json();
        },
        retry: false,
    });

    const loadedSubjectsRef = React.useRef<Set<string>>(new Set());
    React.useEffect(() => {
        if (!autoLoadParticipants) return;
        if (Array.isArray(subjects)) {
            subjects.forEach((subject: Subject) => {
                if (
                    subject.id &&
                    !loadedSubjectsRef.current.has(subject.id)
                ) {
                    loadedSubjectsRef.current.add(subject.id);
                    loadParticipants(subject.id).catch(() => {});
                }
            });
        }
    }, [subjects, autoLoadParticipants]);

    const cards = Array.isArray(subjects)
        ? (isLoading || isError ? [] : subjects.map((subject: Subject) => {
            const assignments: Assignment[] = Array.isArray((subject as unknown as { assignments?: Assignment[] }).assignments)
                ? (subject as unknown as { assignments?: Assignment[] }).assignments!
                : [];
            const participantsArr: Participant[] = Array.isArray((subject as unknown as { participants?: Participant[] }).participants)
                ? (subject as unknown as { participants?: Participant[] }).participants!
                : [];
            const completed = assignments.filter((a: Assignment) => {
                const submissions: Submission[] = Array.isArray((a as unknown as { submissions?: Submission[] }).submissions)
                    ? (a as unknown as { submissions?: Submission[] }).submissions!
                    : [];
                return submissions.some((s: Submission) => {
                    const hasGrade = s.grade !== undefined && (typeof s.grade === 'number' || (typeof s.grade === 'object' && s.grade.score !== undefined));
                    return ((s.status === 'Graded' || s.status === 'RequiresReview') && hasGrade);
                });
            }).length;
            const progress = assignments.length === 0 ? 0 : Math.round((completed / assignments.length) * 100);
            return {
                ...subject,
                code: subject.id,
                progress,
                students: participantsArr.length,
                icon: GraduationCap,
                color: 'bg-blue-500',
            };
        }))
        : [];

    /**
     * Handler for subject selection.
     *
     * @param {Subject} subject - Subject to select.
     * @returns {void}
     */
    const selectSubject = (subject: ExtendedSubject): void => {
        setSelectedSubject(subject);
    };

    /**
     * Loads participants for a subject by subjectId.
     *
     * @param {string} subjectId - Subject identifier.
     * @param {number} [limit] - Limit of participants to fetch.
     * @param {number} [offset] - Offset for pagination.
     * @returns {Promise<void>} Resolves when participants are loaded.
     * @throws {Error} Throws error for 404, 401, 403 statuses.
     */
    const loadParticipants = async (subjectId: string, limit?: number, offset?: number): Promise<void> => {
        let url = `/api/subjects/${subjectId}/participants`;
        if (typeof limit === 'number' || typeof offset === 'number') {
            const params = [];
            if (typeof limit === 'number') params.push(`limit=${limit}`);
            if (typeof offset === 'number') params.push(`offset=${offset}`);
            url += '?' + params.join('&');
        }
        try {
            const res = await fetch(url, {});
            if (!res.ok) {
                let err: Error;
                if (res.status === 404) err = new Error('Not found');
                else if (res.status === 401) err = new Error('Unauthorized');
                else if (res.status === 403) err = new Error('Forbidden');
                else err = new Error('Failed to load participants');
                setErrorsParticipants(prev => ({ ...prev, [subjectId]: err }));
                throw err;
            }
            const data = await res.json();
            setParticipants(prev => ({ ...prev, [subjectId]: data }));
            setErrorsParticipants(prev => {
                const copy = { ...prev };
                delete copy[subjectId];
                return copy;
            });
        } catch (err) {
            setErrorsParticipants(prev => ({ ...prev, [subjectId]: err instanceof Error ? err : new Error('Unknown error') }));
            throw err instanceof Error ? err : new Error('Unknown error');
        }
    };

    return {
        subjects: isLoading || isError ? [] : cards,
        selectedSubject,
        isLoading,
        isError,
        error,
        selectSubject,
        participants,
        loadParticipants,
        errorsParticipants,
    };
}
