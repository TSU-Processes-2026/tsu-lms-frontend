export type AssessmentFormat = 'checklist' | 'percentage' | 'numeric' | 'boolean' | 'scale';
export type AssessmentType = 'SELF' | 'INSTRUCTOR' | 'PEER';

export interface Criterion {
    id: string;
    taskId: string;
    title?: string;
    description: string;
    criterionType?: 'active' | 'passive';
    format: AssessmentFormat;
    weight?: number;
    maxPoints?: number;
    minValue?: number;
    points?: number;
    isBonus?: boolean;
    isPenalty?: boolean;
    isRequired?: boolean;
    isHiddenUntilVisibility?: boolean;
    appliesTo?: 'student' | 'team' | 'both';
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
    finalSource?: 'peer' | 'teacher' | 'mixed';
    reviewerCount?: number;
    calculatedAt: string;
}
