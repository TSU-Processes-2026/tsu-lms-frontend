export interface GradeRequest {
    score: number;
    verdictText: string;
}

export interface ChangeGrade extends GradeRequest {}

export interface GradeResponse {}
