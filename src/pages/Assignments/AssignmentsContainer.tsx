import React, { useState, useCallback, useEffect } from 'react';
import { AssignmentsPage } from './AssignmentsPage';
import { AssignmentModal, SelfAssessmentDraft } from './AssignmentModal';
import { SolutionsListPage } from './SolutionsPage';
import { TeacherReviewModal } from './TeacherReviewModal';
import {
    Assignment,
    Submission,
    Role,
    Question,
    Grade,
    TeamMemberGrade,
} from '../../types/assignments/assignments';
import { useProfile } from '@/hooks/profile/useProfile';
import { DEV_URL, MOCK_URL, PROD_URL } from '@/constants/config/config';
import { ACCESS_TOKEN } from '@/constants/auth/auth';
import { transformAnswersToApi } from '@/utils/answerTransformer';
import { ApiGrade, ApiSubmission, mapSubmission } from '@/utils/submissionMapper';
import { Team } from '@/types/command/Team';
import { TeamDecisionModal } from './TeamDecisionModal';

import { Criterion, CriterionResult, StudentCourseGrade } from '@/types/assignments/criteria';
import { CriteriaManagerPanel } from './CriteriaManagerPanel';
import { SubmissionAssessmentPanel } from './SubmissionAssessmentPanel';
import { CourseGradesPanel } from './CourseGradesPanel';
import { ReviewList } from './ReviewList';
import { PeerReviewModal } from './PeerReviewModal';
import { TeacherReviewDetail } from './TeacherReviewDetail';
import { AnalyticsTable } from './AnalyticsTable';
import { ReviewAssignmentDto } from '@/types/assignments/reviews';

interface Participant {
    userId: string;
    username: string;
    role?: string;
}

interface TeamGradeRequestOptions {
    teamId?: string | null;
    assignmentId: string;
    redistributeTotalScore?: boolean;
    totalScore?: number | null;
}

interface ApiTeamGrade {
    id: string;
    teamId: string;
    assignmentId: string;
    submissionId: string;
    score: number;
    redistributeTotalScore: boolean;
    totalScore: number | null;
    verdictText: string;
    verdictedAt: string;
}

interface ApiTeamMemberGrade {
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

export const AssignmentsContainer: React.FC = () => {
    const { profile, getCurrentUser } = useProfile();
    const [online, setOnline] = useState<boolean | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [subjectRoles, setSubjectRoles] = useState<Record<string, Role>>({});
    const [participantsBySubject, setParticipantsBySubject] = useState<
        Record<string, Participant[]>
    >({});
    const [teamsBySubject, setTeamsBySubject] = useState<Record<string, Team[]>>({});

    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [showSolutionsList, setShowSolutionsList] = useState<Assignment | null>(null);
    const [teamDecisionAssignment, setTeamDecisionAssignment] = useState<Assignment | null>(null);
    const [reviewing, setReviewing] = useState<Submission | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [criteriaByTask, setCriteriaByTask] = useState<Record<string, Criterion[]>>({});
    const [criteriaHiddenByTask, setCriteriaHiddenByTask] = useState<Record<string, boolean>>({});
    const [criterionResultsBySubmission, setCriterionResultsBySubmission] = useState<Record<string, CriterionResult[]>>({});
    const [courseGrades, setCourseGrades] = useState<StudentCourseGrade[]>([]);
    const [selectedGradeSubjectId, setSelectedGradeSubjectId] = useState<string | null>(null);
    const [showReviewList, setShowReviewList] = useState(false);
    const [selectedReviewAssignment, setSelectedReviewAssignment] = useState<ReviewAssignmentDto | null>(null);
    const [showTeacherDetailFor, setShowTeacherDetailFor] = useState<Submission | null>(null);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const subjectIds = [...new Set(assignments.map((a) => a.subjectId))];
    const subjects = subjectIds.map((id) => ({
        id,
        title: assignments.find((a) => a.subjectId === id)?.content.split('\n')[0] || id,
    }));

    const API_BASE = DEV_URL || PROD_URL || MOCK_URL;

    useEffect(() => {
        getCurrentUser();
    }, []);

    const findTeamForAuthor = useCallback(
        (subjectId: string, authorId: string): Team | null =>
            teamsBySubject[subjectId]?.find((team) =>
                team.members.some((member) => member.userId === authorId),
            ) ?? null,
        [teamsBySubject],
    );

    const mapTeamGradeToApiGrade = useCallback(
        (teamGrade: ApiTeamGrade): ApiGrade => ({
            id: teamGrade.id,
            teamId: teamGrade.teamId,
            assignmentId: teamGrade.assignmentId,
            submissionId: teamGrade.submissionId,
            score: teamGrade.score,
            redistributeTotalScore: teamGrade.redistributeTotalScore,
            totalScore: teamGrade.totalScore,
            verdictText: teamGrade.verdictText,
            verdictedAt: teamGrade.verdictedAt,
        }),
        [],
    );

    const fetchGrade = useCallback(
        async (
            submissionId: string,
            assignmentId: string,
            subjectId: string,
            authorId: string,
            headers: HeadersInit,
            teamsLookup?: Record<string, Team[]>,
        ): Promise<ApiGrade | null> => {
            const teams = teamsLookup?.[subjectId] ?? [];
            const team = teams.find((candidateTeam) =>
                candidateTeam.members.some((member) => member.userId === authorId),
            );

            if (team) {
                const teamGradeResponse = await fetch(
                    `${API_BASE}/teams/${team.id}/assignments/${assignmentId}/grade`,
                    { headers },
                );

                if (teamGradeResponse.ok) {
                    const teamGrade = (await teamGradeResponse.json()) as ApiTeamGrade;
                    return teamGrade.submissionId === submissionId
                        ? mapTeamGradeToApiGrade(teamGrade)
                        : null;
                }

                if (teamGradeResponse.status !== 404) {
                    return null;
                }
            }

            const gradeResponse = await fetch(`${API_BASE}/submissions/${submissionId}/grade`, {
                headers,
            });
            if (gradeResponse.status === 404) return null;
            if (!gradeResponse.ok) return null;
            return (await gradeResponse.json()) as ApiGrade;
        },
        [API_BASE, mapTeamGradeToApiGrade],
    );

    const getRoleForSubject = (participants: Participant[]): Role => {
        const current = participants.find((p) => p.userId === profile.id);
        const roleValue = current?.role?.toLowerCase();
        if (roleValue === 'teacher' || roleValue === 'admin') return 'teacher';
        return 'student';
    };

    const loadData = useCallback(async () => {
        const accessToken = localStorage.getItem(ACCESS_TOKEN);
        if (!accessToken) {
            setOnline(false);
            return;
        }
        setLoading(true);
        const headers = { Authorization: `Bearer ${accessToken}` };

        try {
            const subjRes = await fetch(`${API_BASE}/subjects?limit=100&offset=0`, { headers });
            if (!subjRes.ok) {
                setOnline(false);
                return;
            }
            setOnline(true);
            const subjectsData = await subjRes.json();
            const nextParticipants: Record<string, Participant[]> = {};
            const nextRoles: Record<string, Role> = {};
            const nextTeams: Record<string, Team[]> = {};

            for (const subject of subjectsData) {
                const partRes = await fetch(
                    `${API_BASE}/subjects/${subject.id}/participants?limit=200&offset=0`,
                    { headers },
                );
                if (partRes.ok) {
                    const participants = await partRes.json();
                    nextParticipants[subject.id] = participants;
                    nextRoles[subject.id] = getRoleForSubject(participants);
                } else {
                    nextParticipants[subject.id] = [];
                    nextRoles[subject.id] = 'student';
                }

                const teamsRes = await fetch(`${API_BASE}/subjects/${subject.id}/teams`, {
                    headers,
                });

                if (teamsRes.ok) {
                    const teamsPayload = await teamsRes.json();
                    nextTeams[subject.id] = (teamsPayload.teams ?? []).map((team: Team) => ({
                        ...team,
                        memberIds:
                            team.memberIds && team.memberIds.length > 0
                                ? team.memberIds
                                : (team.members || []).map((member) => member.userId),
                        captainId: team.captainId ?? null,
                    }));
                } else {
                    nextTeams[subject.id] = [];
                }
            }

            setParticipantsBySubject(nextParticipants);
            setSubjectRoles(nextRoles);
            setTeamsBySubject(nextTeams);

            let allAssignments: Assignment[] = [];
            let allSubmissions: Submission[] = [];

            for (const subject of subjectsData) {
                const assRes = await fetch(
                    `${API_BASE}/subjects/${subject.id}/assignments?limit=50&offset=0`,
                    { headers },
                );

                if (!assRes.ok) continue;

                const assignmentsData: Assignment[] = await assRes.json();
                const normalizedAssignments = assignmentsData.map((assignment) => ({
                    ...assignment,
                    questions: assignment.questions ?? [],
                }));
                allAssignments = allAssignments.concat(normalizedAssignments);

                const role = nextRoles[subject.id] ?? 'student';
                const isTeacher = role === 'teacher';
                const nameMap = new Map(
                    (nextParticipants[subject.id] ?? []).map((p: Participant) => [
                        p.userId,
                        p.username,
                    ]),
                );

                for (const assignment of normalizedAssignments) {
                    const subRes = await fetch(
                        `${API_BASE}/assignments/${assignment.id}/submissions?limit=100&offset=0&isTeacher=${isTeacher}`,
                        { headers },
                    );
                    if (!subRes.ok) continue;

                    const submissionsData: ApiSubmission[] = await subRes.json();
                    const grades = await Promise.all(
                        submissionsData.map((s) =>
                            fetchGrade(
                                s.id,
                                assignment.id,
                                assignment.subjectId,
                                s.authorId,
                                headers,
                                nextTeams,
                            ),
                        ),
                    );

                    submissionsData.forEach((s, idx) => {
                        allSubmissions.push(mapSubmission(s, grades[idx], nameMap.get(s.authorId)));
                    });
                }
            }

            setAssignments(allAssignments);
            setSubmissions(allSubmissions);
        } catch {
            setOnline(false);
        } finally {
            setLoading(false);
        }
    }, [API_BASE, profile.id, fetchGrade]);

    useEffect(() => {
        if (profile.id) {
            loadData();
        }
    }, [profile.id, loadData]);

    const refreshSubmissions = useCallback(async () => {
        const accessToken = localStorage.getItem(ACCESS_TOKEN);
        if (!accessToken) return;

        const headers = { Authorization: `Bearer ${accessToken}` };
        try {
            let updated: Submission[] = [];

            for (const assignment of assignments) {
                const role = subjectRoles[assignment.subjectId] ?? 'student';
                const isTeacher = role === 'teacher';
                const subRes = await fetch(
                    `${API_BASE}/assignments/${assignment.id}/submissions?limit=100&offset=0&isTeacher=${isTeacher}`,
                    { headers },
                );
                if (!subRes.ok) continue;

                const submissionsData: ApiSubmission[] = await subRes.json();
                const grades = await Promise.all(
                    submissionsData.map((s) =>
                        fetchGrade(
                            s.id,
                            assignment.id,
                            assignment.subjectId,
                            s.authorId,
                            headers,
                            teamsBySubject,
                        ),
                    ),
                );
                const nameMap = new Map(
                    (participantsBySubject[assignment.subjectId] ?? []).map((p: Participant) => [
                        p.userId,
                        p.username,
                    ]),
                );

                submissionsData.forEach((s, idx) => {
                    updated.push(mapSubmission(s, grades[idx], nameMap.get(s.authorId)));
                });
            }

            setSubmissions(updated);
        } catch {
            return;
        }
    }, [API_BASE, assignments, subjectRoles, participantsBySubject, fetchGrade]);

    const upsertDraftSubmission = useCallback(
        async (
            assignmentId: string,
            questions: Question[],
            answers: Record<string, any>,
            selfAssessments: SelfAssessmentDraft[] = [],
        ) => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            if (!accessToken) throw new Error('Требуется авторизация');

            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            };

            const payload = transformAnswersToApi(questions, answers);
            const existing = submissions.find(
                (s) => s.assignmentId === assignmentId && s.authorId === profile.id,
            );

            const shouldSendSelfAssessments = selfAssessments.length > 0;

            const response = shouldSendSelfAssessments
                ? await fetch(`${API_BASE}/tasks/${assignmentId}/submissions`, {
                      method: 'POST',
                      headers,
                      body: JSON.stringify({
                          answers: payload.answers,
                          selfAssessments,
                      }),
                  })
                : existing
                ? await fetch(`${API_BASE}/submissions/${existing.id}`, {
                      method: 'PATCH',
                      headers,
                      body: JSON.stringify(payload),
                  })
                : await fetch(
                      `${API_BASE}/assignments/${assignmentId}/submissions?isStudent=true`,
                      {
                          method: 'POST',
                          headers,
                          body: JSON.stringify(payload),
                      },
                  );

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || `Ошибка ${response.status}`);
            }

            return (await response.json()) as ApiSubmission;
        },
        [API_BASE, submissions, profile.id],
    );

    const submitAssignment = useCallback(
        async (
            assignmentId: string,
            questions: Question[],
            answers: Record<string, any>,
            selfAssessments: SelfAssessmentDraft[] = [],
        ) => {
            setSubmitting(true);
            try {
                const draft = await upsertDraftSubmission(assignmentId, questions, answers, selfAssessments);
                const accessToken = localStorage.getItem(ACCESS_TOKEN);
                if (!accessToken) throw new Error('Требуется авторизация');

                const submitRes = await fetch(`${API_BASE}/submissions/${draft.id}/submit`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (!submitRes.ok) {
                    const error = await submitRes.json().catch(() => ({}));
                    throw new Error(error.detail || `Ошибка ${submitRes.status}`);
                }

                await refreshSubmissions();
                return true;
            } catch (err) {
                alert('Не удалось отправить: ' + (err as Error).message);
                return false;
            } finally {
                setSubmitting(false);
            }
        },
        [API_BASE, upsertDraftSubmission, refreshSubmissions],
    );

    const saveDraft = useCallback(
        async (
            assignmentId: string,
            questions: Question[],
            answers: Record<string, any>,
            selfAssessments: SelfAssessmentDraft[] = [],
        ) => {
            setSubmitting(true);
            try {
                await upsertDraftSubmission(assignmentId, questions, answers, selfAssessments);
                await refreshSubmissions();
                return true;
            } catch (err) {
                alert('Не удалось сохранить: ' + (err as Error).message);
                return false;
            } finally {
                setSubmitting(false);
            }
        },
        [upsertDraftSubmission, refreshSubmissions],
    );

    const withdrawSubmission = useCallback(
        async (submissionId: string) => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            if (!accessToken) return false;

            try {
                const response = await fetch(`${API_BASE}/submissions/${submissionId}/withdraw`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(error.detail || `Ошибка ${response.status}`);
                }

                await refreshSubmissions();
                return true;
            } catch (err) {
                alert('Не удалось отменить отправку: ' + (err as Error).message);
                return false;
            }
        },
        [API_BASE, refreshSubmissions],
    );

    const createGrade = useCallback(
        async (
            submissionId: string,
            score: number,
            verdictText: string,
            options?: TeamGradeRequestOptions,
        ): Promise<Grade | null> => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            if (!accessToken) return null;

            const isTeamGrade = Boolean(options?.teamId);
            const endpoint = isTeamGrade
                ? `${API_BASE}/teams/${options!.teamId}/assignments/${options!.assignmentId}/grade`
                : `${API_BASE}/submissions/${submissionId}/grade`;
            const payload = isTeamGrade
                ? {
                      submissionId,
                      score,
                      verdictText,
                      redistributeTotalScore: options?.redistributeTotalScore ?? false,
                      totalScore: options?.redistributeTotalScore
                          ? options?.totalScore ?? 0
                          : null,
                  }
                : { score, verdictText };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || `Ошибка ${response.status}`);
            }

            await refreshSubmissions();
            const responsePayload = (await response.json()) as ApiGrade | ApiTeamGrade;
            const gradePayload = isTeamGrade
                ? mapTeamGradeToApiGrade(responsePayload as ApiTeamGrade)
                : (responsePayload as ApiGrade);
            return {
                id: gradePayload.id,
                submissionId: gradePayload.submissionId,
                teamId: gradePayload.teamId,
                assignmentId: gradePayload.assignmentId,
                score: gradePayload.score,
                redistributeTotalScore: gradePayload.redistributeTotalScore ?? false,
                totalScore: gradePayload.totalScore ?? null,
                verdictText: gradePayload.verdictText,
                gradedAt: gradePayload.verdictedAt,
            };
        },
        [API_BASE, refreshSubmissions, mapTeamGradeToApiGrade],
    );

    const updateGrade = useCallback(
        async (
            submissionId: string,
            score: number,
            verdictText: string,
            options?: TeamGradeRequestOptions,
        ): Promise<Grade | null> => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            if (!accessToken) return null;

            const isTeamGrade = Boolean(options?.teamId);
            const endpoint = isTeamGrade
                ? `${API_BASE}/teams/${options!.teamId}/assignments/${options!.assignmentId}/grade`
                : `${API_BASE}/submissions/${submissionId}/grade`;
            const payload = isTeamGrade
                ? {
                      score,
                      verdictText,
                      redistributeTotalScore: options?.redistributeTotalScore ?? false,
                      totalScore: options?.redistributeTotalScore
                          ? options?.totalScore ?? 0
                          : null,
                  }
                : { score, verdictText };

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || `Ошибка ${response.status}`);
            }

            await refreshSubmissions();
            const responsePayload = (await response.json()) as ApiGrade | ApiTeamGrade;
            const gradePayload = isTeamGrade
                ? mapTeamGradeToApiGrade(responsePayload as ApiTeamGrade)
                : (responsePayload as ApiGrade);
            return {
                id: gradePayload.id,
                submissionId: gradePayload.submissionId,
                teamId: gradePayload.teamId,
                assignmentId: gradePayload.assignmentId,
                score: gradePayload.score,
                redistributeTotalScore: gradePayload.redistributeTotalScore ?? false,
                totalScore: gradePayload.totalScore ?? null,
                verdictText: gradePayload.verdictText,
                gradedAt: gradePayload.verdictedAt,
            };
        },
        [API_BASE, refreshSubmissions, mapTeamGradeToApiGrade],
    );

    const deleteGrade = useCallback(
        async (submissionId: string, options?: TeamGradeRequestOptions): Promise<boolean> => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            if (!accessToken) return false;

            const endpoint = options?.teamId
                ? `${API_BASE}/teams/${options.teamId}/assignments/${options.assignmentId}/grade`
                : `${API_BASE}/submissions/${submissionId}/grade`;

            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || `Ошибка ${response.status}`);
            }

            await refreshSubmissions();
            return true;
        },
        [API_BASE, refreshSubmissions],
    );

    const loadTeamMemberGrades = useCallback(
        async (
            teamId: string,
            assignmentId: string,
            memberIds: string[],
        ): Promise<TeamMemberGrade[]> => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            if (!accessToken || memberIds.length === 0) return [];

            const responses = await Promise.all(
                memberIds.map(async (studentId) => {
                    const response = await fetch(
                        `${API_BASE}/teams/${teamId}/assignments/${assignmentId}/students/${studentId}/grade`,
                        { headers: { Authorization: `Bearer ${accessToken}` } },
                    );

                    if (!response.ok) {
                        return null;
                    }

                    return (await response.json()) as ApiTeamMemberGrade;
                }),
            );

            return responses.filter((item): item is ApiTeamMemberGrade => item != null);
        },
        [API_BASE],
    );

    const upsertTeamMemberGrade = useCallback(
        async (
            teamId: string,
            assignmentId: string,
            studentId: string,
            score: number,
        ): Promise<TeamMemberGrade | null> => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            if (!accessToken) return null;

            const response = await fetch(
                `${API_BASE}/teams/${teamId}/assignments/${assignmentId}/students/${studentId}/grade`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ score }),
                },
            );

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || `Ошибка ${response.status}`);
            }

            return (await response.json()) as ApiTeamMemberGrade;
        },
        [API_BASE],
    );

    const deleteTeamMemberGrade = useCallback(
        async (teamId: string, assignmentId: string, studentId: string): Promise<boolean> => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            if (!accessToken) return false;

            const response = await fetch(
                `${API_BASE}/teams/${teamId}/assignments/${assignmentId}/students/${studentId}/grade`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${accessToken}` },
                },
            );

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || `Ошибка ${response.status}`);
            }

            return true;
        },
        [API_BASE],
    );

    const loadSubmissionComments = useCallback(
        async (submissionId: string) => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            if (!accessToken) return [];

            const response = await fetch(
                `${API_BASE}/comments?targetType=Submission&targetId=${submissionId}&limit=100&offset=0`,
                { headers: { Authorization: `Bearer ${accessToken}` } },
            );

            if (!response.ok) return [];
            return await response.json();
        },
        [API_BASE],
    );

    const addSubmissionComment = useCallback(
        async (submissionId: string, text: string) => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            if (!accessToken) return null;

            const response = await fetch(`${API_BASE}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ targetType: 'Submission', targetId: submissionId, text }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || `Ошибка ${response.status}`);
            }

            return await response.json();
        },
        [API_BASE],
    );

    const closeAll = () => {
        setSelectedAssignment(null);
        setSelectedSubmission(null);
        setShowSolutionsList(null);
        setTeamDecisionAssignment(null);
        setReviewing(null);
    };

    const fetchCriteria = useCallback(
        async (taskId: string) => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            if (!accessToken) return;
            const response = await fetch(`${API_BASE}/tasks/${taskId}/criteria`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!response.ok) return;
            const payload = await response.json();
            const criteria = Array.isArray(payload) ? payload : payload.criteria ?? [];
            setCriteriaByTask((prev) => ({ ...prev, [taskId]: criteria }));
            setCriteriaHiddenByTask((prev) => ({ ...prev, [taskId]: Boolean(payload.hidden) }));
        },
        [API_BASE],
    );

    const fetchSubmissionCriteriaResults = useCallback(
        async (submissionId: string) => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            if (!accessToken) return;
            const response = await fetch(`${API_BASE}/submissions/${submissionId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!response.ok) return;
            const payload = await response.json();
            const results = payload.criterionResults ?? payload.criteriaResults ?? [];
            setCriterionResultsBySubmission((prev) => ({ ...prev, [submissionId]: results }));
        },
        [API_BASE],
    );

    const upsertInstructorResult = useCallback(
        async (submissionId: string, criterionId: string, value: number, comment?: string) => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            if (!accessToken) return;

            await fetch(`${API_BASE}/submissions/${submissionId}/criteria`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    results: [{ criterionId, value, comment }],
                }),
            });

            setCriterionResultsBySubmission((prev) => {
                const current = prev[submissionId] ?? [];
                const rest = current.filter(
                    (x) => !(x.criterionId === criterionId && x.assessmentType === 'INSTRUCTOR'),
                );
                return {
                    ...prev,
                    [submissionId]: [
                        ...rest,
                        {
                            id: `${submissionId}-${criterionId}-instructor`,
                            submissionId,
                            criterionId,
                            value,
                            comment,
                            assessmentType: 'INSTRUCTOR',
                        },
                    ],
                };
            });
        },
        [API_BASE],
    );

    const addCriterion = useCallback(
        async (assignmentId: string, payload: Omit<Criterion, 'id' | 'taskId' | 'order'>) => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            if (!accessToken) return;
            const response = await fetch(`${API_BASE}/tasks/${assignmentId}/criteria`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    title: payload.title,
                    description: payload.description,
                    criterionType: payload.criterionType,
                    format: payload.format,
                    weight: payload.weight,
                    maxPoints: payload.maxPoints,
                    minValue: payload.minValue,
                    isBonus: payload.isBonus ?? false,
                    isPenalty: payload.isPenalty ?? false,
                    isRequired: payload.isRequired ?? false,
                    isHiddenUntilVisibility: payload.isHiddenUntilVisibility ?? false,
                    appliesTo: payload.appliesTo,
                }),
            });
            if (response.ok) {
                await fetchCriteria(assignmentId);
                return;
            }
            setCriteriaByTask((prev) => {
                const current = prev[assignmentId] ?? [];
                return {
                    ...prev,
                    [assignmentId]: [
                        ...current,
                        {
                            ...payload,
                            id: `${assignmentId}-${Date.now()}`,
                            taskId: assignmentId,
                            order: current.length + 1,
                        },
                    ],
                };
            });
        },
        [API_BASE, fetchCriteria],
    );

    const updateCriterion = useCallback(
        async (
            criterionId: string,
            payload: Partial<Omit<Criterion, 'id' | 'taskId' | 'order'>>,
            assignmentId: string,
        ) => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            if (!accessToken) return;
            const response = await fetch(`${API_BASE}/criteria/${criterionId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    title: payload.title,
                    description: payload.description,
                    criterionType: payload.criterionType,
                    format: payload.format,
                    weight: payload.weight,
                    maxPoints: payload.maxPoints,
                    minValue: payload.minValue,
                    isBonus: payload.isBonus,
                    isPenalty: payload.isPenalty,
                    isRequired: payload.isRequired,
                    isHiddenUntilVisibility: payload.isHiddenUntilVisibility,
                    appliesTo: payload.appliesTo,
                }),
            });
            if (response.ok) {
                await fetchCriteria(assignmentId);
            }
        },
        [API_BASE, fetchCriteria],
    );

    const deleteCriterion = useCallback(
        async (criterionId: string, assignmentId: string) => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            if (!accessToken) return;
            const response = await fetch(`${API_BASE}/criteria/${criterionId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (response.ok) {
                await fetchCriteria(assignmentId);
            }
        },
        [API_BASE, fetchCriteria],
    );

    const recalculateCourseGrades = useCallback(async (subjectId?: string) => {
        const accessToken = localStorage.getItem(ACCESS_TOKEN);
        if (!accessToken || assignments.length === 0) return;
        const targetId = subjectId || selectedGradeSubjectId || assignments[0].subjectId;

        const recalc = await fetch(`${API_BASE}/courses/${targetId}/calculate-grades`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!recalc.ok) return;
        const list = await fetch(`${API_BASE}/courses/${targetId}/grades`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!list.ok) return;
        const rows = await list.json();
        const grades: StudentCourseGrade[] = Array.isArray(rows) ? rows : rows.grades ?? [];
        const participants = participantsBySubject[targetId] ?? [];
        const nameMap = Object.fromEntries(participants.map((p) => [p.userId, p.username]));
        setCourseGrades(grades.map((g) => ({ ...g, studentName: g.studentName || nameMap[g.studentId] || g.studentId })));
    }, [API_BASE, assignments, selectedGradeSubjectId, participantsBySubject]);

    const loadCourseGrades = useCallback(async (subjectId: string) => {
        const accessToken = localStorage.getItem(ACCESS_TOKEN);
        if (!accessToken) return;
        const list = await fetch(`${API_BASE}/courses/${subjectId}/grades`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!list.ok) return;
        const rows = await list.json();
        const grades: StudentCourseGrade[] = Array.isArray(rows) ? rows : rows.grades ?? [];
        const participants = participantsBySubject[subjectId] ?? [];
        const nameMap = Object.fromEntries(participants.map((p) => [p.userId, p.username]));
        setCourseGrades(grades.map((g) => ({ ...g, studentName: g.studentName || nameMap[g.studentId] || g.studentId })));
    }, [API_BASE, participantsBySubject]);

    useEffect(() => {
        if (assignments.length > 0) {
            const initialSubjectId = selectedGradeSubjectId || assignments[0].subjectId;
            loadCourseGrades(initialSubjectId);
        }
    }, [assignments, selectedGradeSubjectId, loadCourseGrades]);

    const openAssignment = (assignment: Assignment) => {
        const mySubmission = submissions.find(
            (s) => s.assignmentId === assignment.id && s.authorId === profile.id,
        );
        setSelectedAssignment(assignment);
        setSelectedSubmission(mySubmission || null);
    };

    const openSubmission = (submission: Submission) => {
        const assignment = assignments.find((a) => a.id === submission.assignmentId) || null;
        if (!assignment) return;
        const role = subjectRoles[assignment.subjectId] ?? 'student';
        if (role === 'teacher' || submission.authorId !== profile.id) {
            setShowSolutionsList(assignment);
            setReviewing(submission);
            return;
        }
        setSelectedAssignment(assignment);
        setSelectedSubmission(submission);
    };

    useEffect(() => {
        const openId = localStorage.getItem('openAssignmentId');
        if (!openId) return;
        const assignment = assignments.find((a) => a.id === openId);
        if (!assignment) return;
        localStorage.removeItem('openAssignmentId');
        openAssignment(assignment);
    }, [assignments, submissions, profile.id]);

    useEffect(() => {
        if (!selectedAssignment) return;
        fetchCriteria(selectedAssignment.id);
    }, [selectedAssignment, fetchCriteria]);

    useEffect(() => {
        if (!selectedSubmission) return;
        fetchSubmissionCriteriaResults(selectedSubmission.id);
    }, [selectedSubmission, fetchSubmissionCriteriaResults]);

    useEffect(() => {
        if (reviewing) {
            fetchSubmissionCriteriaResults(reviewing.id);
            fetchCriteria(reviewing.assignmentId);
        }
    }, [reviewing, fetchSubmissionCriteriaResults, fetchCriteria]);

    const isCriteriaHiddenForStudent = useCallback((assignment: Assignment) => {
        const role = subjectRoles[assignment.subjectId] ?? 'student';
        if (role === 'teacher') return false;
        const now = new Date().getTime();
        try {
            const data = assignment.assignmentData ? JSON.parse(assignment.assignmentData) : {};
            const visibilityDate = data.self_assessment_visibility_date || data.selfAssessmentVisibilityDate;
            if (visibilityDate && now < new Date(visibilityDate).getTime()) return true;
        } catch {}
        if (!assignment.selfAssessmentEnabled) return false;
        if (assignment.deadLine) {
            const oneDayBefore = new Date(assignment.deadLine).getTime() - 24 * 60 * 60 * 1000;
            if (now < oneDayBefore) return true;
            return false;
        }
        return true;
    }, [subjectRoles]);

    const reviewTeam =
        reviewing && showSolutionsList
            ? findTeamForAuthor(showSolutionsList.subjectId, reviewing.authorId)
            : null;

    return (
        <div className='p-4 bg-slate-50 min-h-screen'>
            <div className='mb-6 flex justify-end gap-2'>
                <span className='text-xs text-slate-400 self-center mr-2'>
                    {online === true ? '🌐 Режим API' : '⏳ Проверка соединения...'}
                </span>
            </div>

            {loading ? (
                <div className='p-10 text-center text-slate-500'>Загрузка данных...</div>
            ) : (
                <>
                <AssignmentsPage
                    assignments={assignments}
                    submissions={submissions}
                    currentUserId={profile.id}
                    subjectRoles={subjectRoles}
                    teamsBySubject={teamsBySubject}
                    onOpenAssignment={openAssignment}
                    onOpenSolution={openSubmission}
                    onOpenSolutionsList={(a) => setShowSolutionsList(a)}
                    onOpenTeamDecision={(a) => setTeamDecisionAssignment(a)}
                />

            {selectedAssignment && (
                <div className='mt-6'>
                    <CriteriaManagerPanel
                        assignment={selectedAssignment}
                        criteria={criteriaByTask[selectedAssignment.id] ?? []}
                        isStudent={(subjectRoles[selectedAssignment.subjectId] ?? 'student') !== 'teacher'}
                        criteriaHidden={criteriaHiddenByTask[selectedAssignment.id] ?? isCriteriaHiddenForStudent(selectedAssignment)}
                        onAdd={(payload) => addCriterion(selectedAssignment.id, payload)}
                        onUpdate={(criterionId, payload) =>
                            updateCriterion(criterionId, payload, selectedAssignment.id)
                        }
                        onDelete={(criterionId) => deleteCriterion(criterionId, selectedAssignment.id)}
                    />
                </div>
            )}
            {selectedSubmission && selectedAssignment && (
                <div className='mt-6'>
                    <SubmissionAssessmentPanel
                        submission={selectedSubmission}
                        criteria={criteriaByTask[selectedAssignment.id] ?? []}
                        results={criterionResultsBySubmission[selectedSubmission.id] ?? []}
                        onUpsertInstructor={(criterionId, value) => upsertInstructorResult(selectedSubmission.id, criterionId, value)}
                        isTeacher={(subjectRoles[selectedAssignment.subjectId] ?? 'student') === 'teacher'}
                    />
                </div>
            )}
            {subjects.length > 0 && (
                <div className='mt-6'>
                    <CourseGradesPanel
                        rows={courseGrades}
                        subjects={subjects}
                        selectedSubjectId={selectedGradeSubjectId || subjects[0].id}
                        onSelectSubject={(id) => setSelectedGradeSubjectId(id)}
                        onRecalculate={() => recalculateCourseGrades(selectedGradeSubjectId || subjects[0].id)}
                        onExport={async () => {
                            const targetId = selectedGradeSubjectId || subjects[0].id;
                            const token = localStorage.getItem(ACCESS_TOKEN);
                            if (!token) return;
                            const res = await fetch(`${API_BASE}/courses/${targetId}/grades/export`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            if (!res.ok) return;
                            const blob = await res.blob();
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `grades-${targetId}.csv`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        }}
                        isTeacher={Object.values(subjectRoles).includes('teacher')}
                        currentUserId={profile.id}
                    />
                </div>
            )}

            {Object.values(subjectRoles).includes('teacher') && subjects.length > 0 && (
                <div className='mt-4'>
                    <button
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        className='px-4 py-2 bg-violet-100 text-violet-700 rounded-xl text-sm font-semibold hover:bg-violet-200 transition-all'
                    >
                        {showAnalytics ? 'Скрыть аналитику' : 'Сводная аналитика'}
                    </button>
                    {showAnalytics && (
                        <div className='mt-4'>
                            <AnalyticsTable
                                courseId={selectedGradeSubjectId || subjects[0].id}
                                isTeacherOrAdmin={true}
                            />
                        </div>
                    )}
                </div>
            )}

            {!Object.values(subjectRoles).includes('teacher') && (
                <div className='mt-6'>
                    <button
                        onClick={() => setShowReviewList(!showReviewList)}
                        className='px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all flex items-center gap-2'
                    >
                        {showReviewList ? 'Скрыть проверки' : 'Мои проверки'}
                    </button>
                    {showReviewList && (
                        <div className='mt-4'>
                            <ReviewList
                                onStartReview={(a) => setSelectedReviewAssignment(a)}
                                onContinueReview={(a) => setSelectedReviewAssignment(a)}
                                onViewReview={(a) => setSelectedReviewAssignment(a)}
                            />
                        </div>
                    )}
                </div>
            )}
                </>
            )}

                {selectedAssignment && (
                <AssignmentModal
                    assignment={selectedAssignment}
                    submission={selectedSubmission || undefined}
                    isSubmitting={submitting}
                    criteria={criteriaByTask[selectedAssignment.id] ?? []}
                    criteriaHidden={criteriaHiddenByTask[selectedAssignment.id] ?? isCriteriaHiddenForStudent(selectedAssignment)}
                    criterionResults={selectedSubmission ? (criterionResultsBySubmission[selectedSubmission.id] ?? []) : []}
                    onClose={closeAll}
                    onSaveDraft={async (questions, answers, selfAssessments) => {
                        const success = await saveDraft(selectedAssignment.id, questions, answers, selfAssessments);
                        if (success) closeAll();
                        return success;
                    }}
                    onSubmit={async (questions, answers, selfAssessments) => {
                        const success = await submitAssignment(
                            selectedAssignment.id,
                            questions,
                            answers,
                            selfAssessments,
                        );
                        if (success) closeAll();
                        return success;
                    }}
                    onWithdraw={async (submissionId) => {
                        const success = await withdrawSubmission(submissionId);
                        if (success) closeAll();
                        return success;
                    }}
                />
            )}

            {showSolutionsList && (
                <SolutionsListPage
                    assignment={showSolutionsList}
                    solutions={submissions.filter((s) => s.assignmentId === showSolutionsList.id)}
                    onReview={(s) => setReviewing(s)}
                    onBack={closeAll}
                />
            )}

            {reviewing && showSolutionsList && (
                <>
                <div className='mt-4 flex gap-2'>
                    <button
                        onClick={() => setShowTeacherDetailFor(showTeacherDetailFor ? null : reviewing)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${showTeacherDetailFor ? 'bg-slate-200 text-slate-700' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'}`}
                    >
                        {showTeacherDetailFor ? 'Обычный просмотр' : 'Детальный просмотр'}
                    </button>
                </div>
                {!showTeacherDetailFor && (
                <TeacherReviewModal
                    assignment={showSolutionsList}
                    submission={reviewing}
                    onClose={closeAll}
                    onGradeCreate={createGrade}
                    onGradeUpdate={updateGrade}
                    onGradeDelete={deleteGrade}
                    onLoadComments={loadSubmissionComments}
                    onAddComment={addSubmissionComment}
                    teamMembers={reviewTeam?.members ?? []}
                    onLoadTeamMemberGrades={loadTeamMemberGrades}
                    onUpsertTeamMemberGrade={upsertTeamMemberGrade}
                    onDeleteTeamMemberGrade={deleteTeamMemberGrade}
                    teamGradeOptions={
                        reviewTeam
                            ? {
                                  teamId: reviewTeam.id,
                                  assignmentId: showSolutionsList.id,
                              }
                            : undefined
                    }
                    criteria={criteriaByTask[showSolutionsList.id] ?? []}
                    criterionResults={criterionResultsBySubmission[reviewing.id] ?? []}
                    onUpsertInstructorCriterion={(criterionId, value, comment) =>
                        upsertInstructorResult(reviewing.id, criterionId, value, comment)
                    }
                />
                )}
                </>
            )}

            {reviewing && showSolutionsList && showTeacherDetailFor && (
                <TeacherReviewDetail
                    submissionId={showTeacherDetailFor.id}
                    assignmentId={showSolutionsList.id}
                    courseId={showSolutionsList.subjectId}
                    onClose={() => setShowTeacherDetailFor(null)}
                    onRecalculate={() => recalculateCourseGrades(showSolutionsList.subjectId)}
                />
            )}

            {selectedReviewAssignment && (
                <PeerReviewModal
                    assignment={selectedReviewAssignment}
                    onClose={() => setSelectedReviewAssignment(null)}
                    onSubmitted={() => setSelectedReviewAssignment(null)}
                />
            )}

            {teamDecisionAssignment && (
                <TeamDecisionModal
                    assignment={teamDecisionAssignment}
                    team={
                        teamsBySubject[teamDecisionAssignment.subjectId]?.find((team) =>
                            team.members.some((member) => member.userId === profile.id),
                        ) ?? {
                            id: '',
                            subjectId: teamDecisionAssignment.subjectId,
                            memberIds: [],
                            members: [],
                            captainId: null,
                        }
                    }
                    currentUserId={profile.id}
                    onClose={closeAll}
                />
            )}
        </div>
    );
};
