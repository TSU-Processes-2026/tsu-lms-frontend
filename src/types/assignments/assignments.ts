// src/types/assignment.ts

export type Role = 'teacher' | 'student';
export type AssignmentFilter = 'all' | 'active' | 'submitted' | 'graded';

export interface Option {
    id: string;
    text: string;
}

export interface Question {
    id: string;
    questionType: 'SingleChoice' | 'MultipleChoice' | 'Text' | 'File';
    questionData: string;
    options?: Option[];
}

export interface Comment {
    id: string;
    authorId: string;
    authorName?: string;
    text: string;
    createdAt: string;
}

export interface Assignment {
    id: string;
    subjectId: string;
    authorId: string;
    postType: 'Assignment';
    content: string;
    createdAt: string;
    assignmentData?: string;
    questions: Question[];
}

export type SubmissionStatus = 'Draft' | 'RequiresReview' | 'Graded';

export interface Submission {
    id: string;
    assignmentId: string;
    authorId: string;
    authorName?: string;
    createdAt: string;
    submittedAt?: string;
    answers: Record<string, any>;
    answerItems?: AnswerItemDto[];
    status: SubmissionStatus;
    grade?: Grade;
    comments?: Comment[];
}

export type AnswerTypeEnum = 0 | 1 | 2;

export interface AnswerItemDto {
    id: string;
    assignmentQuestionId: string;
    answerType: AnswerTypeEnum;
    selectedOptionId?: string | null;
    selectedOptionIds?: string[] | null;
    text?: string | null;
}

export interface SubmissionCreateRequest {
    answers: AnswerItemDto[];
}

export interface GradeRequest {
    score: number;
    verdictText: string;
}

export interface Grade {
    id?: string;
    submissionId?: string;
    score: number;
    verdictText: string;
    gradedAt?: string;
}
