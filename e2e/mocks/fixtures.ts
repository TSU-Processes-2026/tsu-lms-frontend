export const TEACHER_ID = 'teacher-uuid-001';
export const TEACHER_NAME = 'преподаватель';
export const SUBJECT_ID = 'subject-math-101';
export const ASSIGNMENT_ID = 'assignment-task-001';
export const ACCESS_TOKEN_VALUE = 'e2e-mock-token';

export function makeProfile() {
    return {
        id: TEACHER_ID,
        username: TEACHER_NAME,
    };
}

export function makeSubjects() {
    return [{ id: SUBJECT_ID, title: 'Математика' }];
}

export function makeSubjectRoles() {
    return [{ subjectId: SUBJECT_ID, userId: TEACHER_ID, role: 'teacher' }];
}

export function makeParticipants() {
    return [
        { userId: TEACHER_ID, username: TEACHER_NAME, role: 'teacher' },
        { userId: 'student-a', username: 'Студент А', role: 'student' },
        { userId: 'student-b', username: 'Студент Б', role: 'student' },
    ];
}

export function makeTeams() {
    return { teams: [] };
}

export function makeAssignments() {
    return [
        {
            id: ASSIGNMENT_ID,
            subjectId: SUBJECT_ID,
            authorId: TEACHER_ID,
            postType: 'Assignment',
            content: 'Домашнее задание №1\nРешить задачи по линейной алгебре.',
            createdAt: '2026-06-01T10:00:00Z',
            assignmentData: JSON.stringify({
                self_assessment_enabled: false,
                max_points: 10,
            }),
            maxPoints: 10,
            selfAssessmentEnabled: false,
            deadLine: '2026-07-15T23:59:00Z',
            questions: [],
        },
    ];
}

export function makeSubmissions() {
    return [];
}

export function makeCriteria() {
    return { criteria: [] };
}

export function makeCourseGrades() {
    return [];
}

export function makeAnalyticsRows() {
    return {
        courseId: SUBJECT_ID,
        taskTitles: ['Домашнее задание №1'],
        rows: [
            {
                studentId: 'student-a',
                studentName: 'Студент А',
                taskGrades: [
                    { taskId: ASSIGNMENT_ID, taskTitle: 'Домашнее задание №1',
                      score: 8, source: 'peer', reviewerCount: 3 },
                ],
                finalCourseGrade: 8,
            },
        ],
    };
}

export function makeReviewAssignments() {
    return [
        { id: 'rev-pending', taskId: ASSIGNMENT_ID, taskTitle: 'Домашнее задание №1',
          submissionId: 'sub-b', reviewTargetType: 'submission', status: 'pending',
          assignedAt: '2026-06-20T10:00:00Z', dueAt: '2026-12-31T23:59:00Z' },
    ];
}
