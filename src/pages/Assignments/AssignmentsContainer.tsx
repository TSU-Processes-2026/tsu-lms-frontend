// src/pages/Assignments/AssignmentsContainer.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { AssignmentsPage } from './AssignmentsPage';
import { AssignmentModal } from './AssignmentModal';
import { SolutionsListPage } from './SolutionsPage';
import { TeacherReviewModal } from './TeacherReviewModal';
import {
    Assignment,
    Submission,
    Role,
    Question,
    SubmissionCreateRequest,
    AnswerTypeEnum,
} from '../../types/assignments/assignments';
import { useProfile } from '@/hooks/profile/useProfile';
import { PROD_URL } from '@/constants/config/config';

// === Преобразование ответов в формат API (согласно OpenAPI) ===
const transformAnswersToApi = (
    questions: Question[],
    userAnswers: Record<string, any>,
): SubmissionCreateRequest => {
    return {
        answers: questions.map((q) => {
            const value = userAnswers[q.id];

            switch (q.questionType) {
                case 'SingleChoice':
                    return {
                        id: crypto.randomUUID(),
                        assignmentQuestionId: q.id,
                        answerType: 0 as AnswerTypeEnum,
                        selectedOptionId: value || null,
                        selectedOptionIds: null,
                        text: null,
                    };
                case 'MultipleChoice':
                    return {
                        id: crypto.randomUUID(),
                        assignmentQuestionId: q.id,
                        answerType: 1 as AnswerTypeEnum,
                        selectedOptionId: null,
                        selectedOptionIds: Array.isArray(value) ? value : [],
                        text: null,
                    };
                default: // Text, ShortText, Essay, File
                    return {
                        id: crypto.randomUUID(),
                        assignmentQuestionId: q.id,
                        answerType: 2 as AnswerTypeEnum,
                        selectedOptionId: null,
                        selectedOptionIds: null,
                        text: typeof value === 'string' ? value : '',
                    };
            }
        }),
    };
};

// === Основной компонент ===
export const AssignmentsContainer: React.FC = () => {
    const { profile } = useProfile();
    const [role, setRole] = useState<Role>('student');
    const [online, setOnline] = useState<boolean | null>(null);
    const [subjects, setSubjects] = useState<
        Array<{ id: string; title: string; description: string }>
    >([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [showSolutionsList, setShowSolutionsList] = useState<Assignment | null>(null);
    const [reviewing, setReviewing] = useState<Submission | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const API_BASE = PROD_URL;

    // === Загрузка всех данных ===
    const loadData = useCallback(async () => {
        const accessToken = localStorage.getItem('accessToken');
        setLoading(true);

        try {
            // 1. Загружаем предметы
            const subjRes = await fetch(`${API_BASE}/subjects?limit=100`, {
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            });

            if (!subjRes.ok) {
                setOnline(false);
                return;
            }

            setOnline(true);
            const subjectsData = await subjRes.json();
            setSubjects(subjectsData);

            // 2. Загружаем задания и сабмишены
            let allAssignments: Assignment[] = [];
            let allSubmissions: Submission[] = [];

            for (const subject of subjectsData) {
                // Задания по предмету: GET /api/subjects/{id}/assignments
                const assRes = await fetch(
                    `${API_BASE}/subjects/${subject.id}/assignments?limit=50&offset=0`,
                    { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} },
                );

                if (assRes.ok) {
                    const assignmentsData: Assignment[] = await assRes.json();
                    allAssignments = allAssignments.concat(assignmentsData);

                    // ✅ Сабмишены по КАЖДОМУ заданию: GET /api/assignments/{id}/submissions
                    // (НЕТ эндпоинта /api/subjects/{id}/submissions!)
                    for (const assignment of assignmentsData) {
                        const subRes = await fetch(
                            `${API_BASE}/assignments/${assignment.id}/submissions?limit=100&offset=0&isTeacher=${role === 'teacher'}`,
                            {
                                headers: accessToken
                                    ? { Authorization: `Bearer ${accessToken}` }
                                    : {},
                            },
                        );
                        if (subRes.ok) {
                            const subData: Submission[] = await subRes.json();
                            allSubmissions = allSubmissions.concat(subData);
                        }
                    }
                }
            }

            setAssignments(allAssignments);
            setSubmissions(allSubmissions);
        } catch (err) {
            console.error('Ошибка загрузки:', err);
            setOnline(false);
        } finally {
            setLoading(false);
        }
    }, [role]);

    // Загрузка при монтировании
    useEffect(() => {
        loadData();
    }, [loadData]);

    // === Обновление списка сабмишенов после отправки/оценки ===
    const refreshSubmissions = useCallback(async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) return;

        try {
            let updated: Submission[] = [];

            for (const subject of subjects) {
                // Сначала получаем задания по предмету
                const assRes = await fetch(
                    `${API_BASE}/subjects/${subject.id}/assignments?limit=50&offset=0`,
                    { headers: { Authorization: `Bearer ${accessToken}` } },
                );

                if (assRes.ok) {
                    const assignmentsData = await assRes.json();

                    // Затем сабмишены по каждому заданию
                    for (const assignment of assignmentsData) {
                        const subRes = await fetch(
                            `${API_BASE}/assignments/${assignment.id}/submissions?limit=100&offset=0&isTeacher=${role === 'teacher'}`,
                            { headers: { Authorization: `Bearer ${accessToken}` } },
                        );
                        if (subRes.ok) {
                            const data = await subRes.json();
                            updated = updated.concat(data);
                        }
                    }
                }
            }
            setSubmissions(updated);
        } catch (err) {
            console.error('Ошибка обновления сабмишенов:', err);
        }
    }, [subjects, role]);

    // === Отправка работы на сервер ===
    const submitAssignment = useCallback(
        async (
            assignmentId: string,
            questions: Question[],
            answers: Record<string, any>,
        ): Promise<boolean> => {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                alert('Требуется авторизация');
                return false;
            }

            setSubmitting(true);

            try {
                // Преобразуем ответы в формат API (согласно OpenAPI)
                const payload: SubmissionCreateRequest = transformAnswersToApi(questions, answers);

                console.log('📤 Отправка сабмишена:', {
                    url: `${API_BASE}/assignments/${assignmentId}/submissions?isStudent=true`,
                    payload,
                });

                // POST /api/assignments/{id}/submissions?isStudent=true
                const response = await fetch(
                    `${API_BASE}/assignments/${assignmentId}/submissions?isStudent=true`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify(payload),
                    },
                );

                if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(error.detail || `Ошибка ${response.status}`);
                }

                // Обновляем список сабмишенов
                await refreshSubmissions();
                return true;
            } catch (err) {
                console.error('❌ Ошибка отправки:', err);
                alert('Не удалось отправить: ' + (err as Error).message);
                return false;
            } finally {
                setSubmitting(false);
            }
        },
        [refreshSubmissions],
    );

    // === Отправка оценки учителем ===
    const submitGrade = useCallback(
        async (submissionId: string, score: number, verdictText: string): Promise<boolean> => {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return false;

            try {
                // POST /api/submissions/{id}/grade
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
                return true;
            } catch (err) {
                console.error('Ошибка оценки:', err);
                alert('Не удалось сохранить оценку');
                return false;
            }
        },
        [refreshSubmissions],
    );

    // === Закрытие всех модалок ===
    const closeAll = () => {
        setSelectedAssignment(null);
        setSelectedSubmission(null);
        setShowSolutionsList(null);
        setReviewing(null);
    };

    return (
        <div className='p-4 bg-slate-50 min-h-screen'>
            {/* Переключатель роли (для тестов) */}
            <div className='mb-6 flex justify-end gap-2'>
                <span className='text-xs text-slate-400 self-center mr-2'>
                    {online === true ? '🌐 Режим API' : '⏳ Проверка соединения...'}
                </span>
                <button
                    className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                        role === 'teacher'
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-200 text-slate-700'
                    }`}
                    onClick={() => setRole('teacher')}
                >
                    Учитель
                </button>
                <button
                    className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                        role === 'student'
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-200 text-slate-700'
                    }`}
                    onClick={() => setRole('student')}
                >
                    Ученик
                </button>
            </div>

            {/* Загрузка */}
            {loading ? (
                <div className='p-10 text-center text-slate-500'>Загрузка данных...</div>
            ) : (
                <AssignmentsPage
                    assignments={assignments}
                    submissions={submissions}
                    token={localStorage.getItem('accessToken') || ''}
                    role={role}
                    onOpenAssignment={(a) => setSelectedAssignment(a)}
                    onOpenSolution={(s) => {
                        console.log('Открыть решение');
                        setSelectedSubmission(s);
                    }}
                    onOpenSolutionsList={(a) => {
                        console.log('Открыть список решений');
                        setShowSolutionsList(a);
                    }}
                />
            )}

            {/* Модалка задания / прохождения теста */}
            {selectedAssignment && (
                <AssignmentModal
                    assignment={selectedAssignment}
                    submission={selectedSubmission || undefined}
                    token={localStorage.getItem('accessToken') || ''}
                    isSubmitting={submitting}
                    onClose={closeAll}
                    onSubmit={async (questions, answers) => {
                        const success = await submitAssignment(
                            selectedAssignment.id,
                            questions,
                            answers,
                        );
                        if (success) closeAll();
                    }}
                    onSubmissionUpdated={refreshSubmissions}
                />
            )}

            {/* Список работ для учителя */}
            {showSolutionsList && (
                <SolutionsListPage
                    assignment={showSolutionsList}
                    solutions={submissions.filter((s) => s.assignmentId === showSolutionsList.id)}
                    onReview={(s) => setReviewing(s)}
                    onBack={closeAll}
                />
            )}

            {/* Модалка проверки работы учителем */}
            {reviewing && showSolutionsList && (
                <TeacherReviewModal
                    assignment={showSolutionsList}
                    submission={reviewing}
                    token={localStorage.getItem('accessToken') || ''}
                    onClose={closeAll}
                    onGradeUpdated={refreshSubmissions}
                    onGradeSubmit={submitGrade}
                />
            )}
        </div>
    );
};
