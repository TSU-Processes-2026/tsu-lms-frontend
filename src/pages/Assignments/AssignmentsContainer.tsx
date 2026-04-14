import React, { useState, useCallback, useEffect } from 'react';
import { AssignmentsPage } from './AssignmentsPage';
import { AssignmentModal } from './AssignmentModal';
import { SolutionsListPage } from './SolutionsPage';
import { TeacherReviewModal } from './TeacherReviewModal';
import { Assignment, Submission, Role, Question, Grade } from '../../types/assignments/assignments';
import { useProfile } from '@/hooks/profile/useProfile';
import { DEV_URL, MOCK_URL, PROD_URL } from '@/constants/config/config';
import { ACCESS_TOKEN } from '@/constants/auth/auth';
import { transformAnswersToApi } from '@/utils/answerTransformer';
import { ApiGrade, ApiSubmission, mapSubmission } from '@/utils/submissionMapper';
import { Team } from '@/types/command/Team';
import { TeamDecisionModal } from './TeamDecisionModal';

interface Participant {
    userId: string;
    username: string;
    role?: string;
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

    const API_BASE = DEV_URL || PROD_URL || MOCK_URL;

    useEffect(() => {
        getCurrentUser();
    }, []);

    const fetchGrade = async (
        submissionId: string,
        headers: HeadersInit,
    ): Promise<ApiGrade | null> => {
        const res = await fetch(`${API_BASE}/submissions/${submissionId}/grade`, { headers });
        if (res.status === 404) return null;
        if (!res.ok) return null;
        return (await res.json()) as ApiGrade;
    };

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
                        submissionsData.map((s) => fetchGrade(s.id, headers)),
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
    }, [API_BASE, profile.id]);

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
                    submissionsData.map((s) => fetchGrade(s.id, headers)),
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
    }, [API_BASE, assignments, subjectRoles, participantsBySubject]);

    const upsertDraftSubmission = useCallback(
        async (assignmentId: string, questions: Question[], answers: Record<string, any>) => {
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

            const response = existing
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
        async (assignmentId: string, questions: Question[], answers: Record<string, any>) => {
            setSubmitting(true);
            try {
                const draft = await upsertDraftSubmission(assignmentId, questions, answers);
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
        async (assignmentId: string, questions: Question[], answers: Record<string, any>) => {
            setSubmitting(true);
            try {
                await upsertDraftSubmission(assignmentId, questions, answers);
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
        async (submissionId: string, score: number, verdictText: string): Promise<Grade | null> => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            if (!accessToken) return null;

            const response = await fetch(`${API_BASE}/submissions/${submissionId}/grade`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ score, verdictText }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || `Ошибка ${response.status}`);
            }

            await refreshSubmissions();
            const payload = (await response.json()) as ApiGrade;
            return {
                id: payload.id,
                submissionId: payload.submissionId,
                score: payload.score,
                verdictText: payload.verdictText,
                gradedAt: payload.verdictedAt,
            };
        },
        [API_BASE, refreshSubmissions],
    );

    const updateGrade = useCallback(
        async (submissionId: string, score: number, verdictText: string): Promise<Grade | null> => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            if (!accessToken) return null;

            const response = await fetch(`${API_BASE}/submissions/${submissionId}/grade`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ score, verdictText }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || `Ошибка ${response.status}`);
            }

            await refreshSubmissions();
            const payload = (await response.json()) as ApiGrade;
            return {
                id: payload.id,
                submissionId: payload.submissionId,
                score: payload.score,
                verdictText: payload.verdictText,
                gradedAt: payload.verdictedAt,
            };
        },
        [API_BASE, refreshSubmissions],
    );

    const deleteGrade = useCallback(
        async (submissionId: string): Promise<boolean> => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            if (!accessToken) return false;

            const response = await fetch(`${API_BASE}/submissions/${submissionId}/grade`, {
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
            )}

            {selectedAssignment && (
                <AssignmentModal
                    assignment={selectedAssignment}
                    submission={selectedSubmission || undefined}
                    isSubmitting={submitting}
                    onClose={closeAll}
                    onSaveDraft={async (questions, answers) => {
                        const success = await saveDraft(selectedAssignment.id, questions, answers);
                        if (success) closeAll();
                        return success;
                    }}
                    onSubmit={async (questions, answers) => {
                        const success = await submitAssignment(
                            selectedAssignment.id,
                            questions,
                            answers,
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
                <TeacherReviewModal
                    assignment={showSolutionsList}
                    submission={reviewing}
                    onClose={closeAll}
                    onGradeCreate={createGrade}
                    onGradeUpdate={updateGrade}
                    onGradeDelete={deleteGrade}
                    onLoadComments={loadSubmissionComments}
                    onAddComment={addSubmissionComment}
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
