export interface Subject {
    id: string;
    title: string;
    description: string;
    gradingMode?: string;
    selfAssessmentEnabled?: boolean;
    finalGradeScaleId?: string | null;
    peerReviewEnabled?: boolean;
    peerReviewScope?: string;
    peerReviewMode?: string;
    peerReviewDeadlinePolicy?: string;
    teacherFinalMode?: string;
    pairingStrategy?: string;
    showCriteriaBeforeDeadline?: boolean;
    liveReviewMode?: boolean;
    defaultReviewTimeLimitMinutes?: number;
    teamReviewPolicy?: string;
}

export interface GradeScaleRange {
    id?: string;
    minPoints: number;
    maxPoints: number;
    grade: string;
}
