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
    maxPoints?: number | null;
    selfAssessmentEnabled?: boolean | null;
    selfAssessmentVisibilityDate?: string | null;
    deadLine?: string | null;
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
    decisionResult?: 'Approved' | 'Rejected' | 'Expired' | string | null;
    hasDecisionSession?: boolean;
    isDecisionSessionClosed?: boolean;
    isFinalTeamDecision?: boolean;
    grade?: Grade;
    comments?: Comment[];
    criterionResults?: import('./criteria').CriterionResult[];
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
    redistributeTotalScore?: boolean;
    totalScore?: number | null;
}

export interface Grade {
    id?: string;
    submissionId?: string;
    teamId?: string;
    assignmentId?: string;
    score: number;
    verdictText: string;
    redistributeTotalScore?: boolean;
    totalScore?: number | null;
    gradedAt?: string;
}

export interface TeamMemberGrade {
    id?: string;
    teamGradeId: string;
    teamId: string;
    assignmentId: string;
    studentId: string;
    username: string;
    baseScore: number;
    score: number;
    isAdjusted: boolean;
    adjustedAt?: string | null;
}
