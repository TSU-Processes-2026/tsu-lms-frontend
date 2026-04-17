import { AnswerItemDto, Comment, Submission } from '../types/assignments/assignments';

export interface ApiSubmission {
    id: string;
    assignmentId: string;
    authorId: string;
    answers?: AnswerItemDto[] | null;
    status: string | number;
    submittedAt?: string | null;
    decisionResult?: 'Approved' | 'Rejected' | 'Expired' | string | null;
    hasDecisionSession?: boolean;
    isDecisionSessionClosed?: boolean;
    isFinalTeamDecision?: boolean;
}

export interface ApiGrade {
    id: string;
    submissionId: string;
    teamId?: string;
    assignmentId?: string;
    score: number;
    redistributeTotalScore?: boolean;
    totalScore?: number | null;
    verdictText: string;
    verdictedAt: string;
}

export const mapSubmissionAnswers = (items?: AnswerItemDto[] | null): Record<string, any> => {
    if (!items) return {};
    return items.reduce<Record<string, any>>((acc, item) => {
        if (item.answerType === 0) {
            acc[item.assignmentQuestionId] = item.selectedOptionId ?? null;
            return acc;
        }
        if (item.answerType === 1) {
            acc[item.assignmentQuestionId] = item.selectedOptionIds ?? [];
            return acc;
        }
        acc[item.assignmentQuestionId] = item.text ?? '';
        return acc;
    }, {});
};

export const mapSubmission = (
    submission: ApiSubmission,
    grade?: ApiGrade | null,
    authorName?: string,
    comments?: Comment[],
): Submission => {
    const answerItems = submission.answers ?? [];
    const statusValue =
        typeof submission.status === 'number'
            ? submission.status === 0
                ? 'Draft'
                : submission.status === 1
                  ? 'RequiresReview'
                  : 'Graded'
            : submission.status;
    return {
        id: submission.id,
        assignmentId: submission.assignmentId,
        authorId: submission.authorId,
        authorName,
        createdAt: submission.submittedAt ?? new Date().toISOString(),
        submittedAt: submission.submittedAt ?? undefined,
        answers: mapSubmissionAnswers(answerItems),
        answerItems: answerItems,
        status: statusValue as Submission['status'],
        decisionResult: submission.decisionResult ?? null,
        hasDecisionSession: submission.hasDecisionSession ?? false,
        isDecisionSessionClosed: submission.isDecisionSessionClosed ?? false,
        isFinalTeamDecision: submission.isFinalTeamDecision ?? false,
        grade: grade
            ? {
                  id: grade.id,
                  submissionId: grade.submissionId,
                  teamId: grade.teamId,
                  assignmentId: grade.assignmentId,
                  score: grade.score,
                  redistributeTotalScore: grade.redistributeTotalScore ?? false,
                  totalScore: grade.totalScore ?? null,
                  verdictText: grade.verdictText,
                  gradedAt: grade.verdictedAt,
              }
            : undefined,
        comments,
    };
};
