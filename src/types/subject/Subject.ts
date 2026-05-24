export interface Subject {
    id: string;
    title: string;
    description: string;
    gradingMode?: string;
    selfAssessmentEnabled?: boolean;
    finalGradeScaleId?: string | null;
}

export interface GradeScaleRange {
    id?: string;
    minPoints: number;
    maxPoints: number;
    grade: string;
}
