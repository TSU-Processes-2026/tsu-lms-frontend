import { Assignment, Question, Option } from '../../types/assignments/assignments';

export interface ApiOption {
    id: string;
    text: string;
}

export interface ApiQuestion {
    id: string;
    questionType: string;
    questionData: string;
    options?: ApiOption[];
}

export interface ApiAssignment {
    id: string;
    subjectId: string;
    authorId: string;
    postType: string;
    content: string;
    createdAt: string;
    assignmentData?: string;
    questions?: ApiQuestion[];
}

export const mapApiQuestion = (q: ApiQuestion): Question => ({
    id: q.id,
    questionType: q.questionType as Question['questionType'],
    questionData: q.questionData,
    options: q.options?.map((o) => ({ id: o.id, text: o.text })),
});

export const mapApiAssignment = (a: ApiAssignment): Assignment => ({
    id: a.id,
    subjectId: a.subjectId,
    authorId: a.authorId,
    postType: 'Assignment',
    content: a.content,
    createdAt: a.createdAt,
    assignmentData: a.assignmentData,
    questions: (a.questions ?? []).map(mapApiQuestion),
});

export const mapQuestionToApi = (q: Question): ApiQuestion => ({
    id: q.id,
    questionType: q.questionType,
    questionData: q.questionData,
    options: q.options?.map((opt) => ({ id: opt.id, text: opt.text })),
});

export const makeApiPayloadFromAssignment = (assignment: {
    content: string;
    assignmentData?: string | null;
    questions: Question[];
}) => ({
    content: assignment.content,
    assignmentData: assignment.assignmentData ?? null,
    questions: assignment.questions.map(mapQuestionToApi),
});
