export type AssessmentFormat = 'checklist' | 'percentage';
export type AssessmentType = 'SELF' | 'INSTRUCTOR';

export interface Criterion {
    id: string;
    taskId: string;
    description: string;
    format: AssessmentFormat;
    weight?: number;
    maxPoints?: number;
    isBonus?: boolean;
    isPenalty?: boolean;
    order: number;
}

export interface CriterionResult {
    id: string;
    submissionId: string;
    criterionId: string;
    value: number | boolean;
    comment?: string;
    assessmentType: AssessmentType;
    createdAt?: string;
}

export interface StudentCourseGrade {
    studentId: string;
    studentName: string;
    finalScore: number;
    finalGrade: string;
    calculatedAt: string;
}
