export type ReviewStatus = 'pending' | 'opened' | 'submitted' | 'expired' | 'cancelled';
export type ReviewSource = 'peer' | 'teacher';
export type ReviewMode = 'all_to_all' | 'pairs';
export type TeamReviewPolicy = 'each_member_reviews' | 'one_representative_reviews';
export type TeacherFinalMode = 'accept_peer' | 'override_selected' | 'manual_final';
export type PairingStrategy = 'ordered' | 'round_robin' | 'balanced';

export interface ReviewAssignmentDto {
    id: string;
    taskId: string;
    taskTitle: string;
    submissionId: string;
    reviewTargetType: 'submission' | 'team_submission';
    status: ReviewStatus;
    assignedAt: string;
    startsAt?: string;
    dueAt?: string;
    openedAt?: string;
    submittedAt?: string;
    latestReview?: PeerReviewDto;
}

export interface PeerReviewDto {
    id: string;
    overallScore?: number;
    overallComment?: string;
    source: ReviewSource;
    submittedAt: string;
    isFinal: boolean;
    criterionResults?: import('./criteria').CriterionResult[];
}

export interface SubmissionReviewsDto {
    submissionId: string;
    peerReviews: PeerReviewDto[];
    teacherReview?: PeerReviewDto;
}

export interface FinalGradeDto {
    submissionId: string;
    finalScore?: number;
    finalSource?: ReviewSource | 'mixed';
    calculatedAt?: string;
}

export interface CourseAnalyticsResponse {
    courseId: string;
    rows: StudentAnalyticsRow[];
    taskTitles: string[];
}

export interface StudentAnalyticsRow {
    studentId: string;
    studentName: string;
    taskGrades: TaskGradeCell[];
    finalCourseGrade?: number;
}

export interface TaskGradeCell {
    taskId: string;
    taskTitle: string;
    score?: number;
    source?: 'peer' | 'teacher' | 'mixed';
    reviewerCount: number;
}
