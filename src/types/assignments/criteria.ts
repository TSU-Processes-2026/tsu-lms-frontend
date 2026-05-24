export type AssessmentFormat = 'checklist' | 'percentage' | 'numeric';
export type AssessmentType = 'SELF' | 'INSTRUCTOR';

export interface Criterion {
    id: string;
    taskId: string;
    description: string;
    format: AssessmentFormat;
    weight?: number;
    maxPoints?: number;
    points?: number;
    isBonus?: boolean;
    isPenalty?: boolean;
    order: number;
}

export interface CriterionResult {
    id: string;
    submissionId: string;
    criterionId: string;
    value: number;
    comment?: string;
    assessmentType: AssessmentType;
    createdBy?: string;
}

export interface StudentCourseGrade {
    id?: string;
    courseId?: string;
    studentId: string;
    studentName?: string;
    finalScore: number;
    finalGrade: string;
    calculatedAt: string;
}
