import { ChangeGrade, GradeRequest } from './Grades';

export interface TeamGradeRequest extends GradeRequest {
    submissionId: string;
}
export interface ChangeTeamGradeRequest extends ChangeGrade {}
