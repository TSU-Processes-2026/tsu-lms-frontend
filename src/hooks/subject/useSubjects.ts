import { useState } from 'react';
import { Subject } from '@/types/subject/Subject.ts';

export interface UseSubjectsResult {
    /**
     * Current list of subjects.
     */
    subjects: Subject[];
    /**
     * Currently selected subject or null.
     */
    selectedSubject: Subject | null;
    /**
     * Function to select a subject.
     * @param {Subject} subject - The subject to select.
     * @returns {void}
     */
    selectSubject: (subject: Subject) => void;
}

/**
 * Custom React hook for managing the list of subjects and handling subject selection.
 * Returns a static list of subjects for demonstration purposes.
 * @returns {UseSubjectsResult} Object containing subjects, selectedSubject, and selectSubject handler.
 * @throws No exceptions are thrown by this hook.
 */
export function useSubjects(): UseSubjectsResult {
    const [subjects] = useState<Subject[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

    const selectSubject = (subject: Subject) => {
        setSelectedSubject(subject);
    };

    return {
        subjects,
        selectedSubject,
        selectSubject,
    };
}
