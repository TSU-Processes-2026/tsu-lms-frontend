import { Assignment, Question } from '../../types/assignments/assignments';

export interface ApiOption {
    id: string;
    text: string;
}

export interface ApiQuestion {
    id: string;
    questionType: string;
    questionData: string;
    options?: ApiOption[];
}

export interface ApiAssignment {
    id: string;
    subjectId: string;
    authorId: string;
    postType: string;
    content: string;
    createdAt: string;
    assignmentData?: string;
    questions?: ApiQuestion[];
}

export const mapApiQuestion = (q: ApiQuestion): Question => ({
    id: q.id,
    text: q.questionData,
    type:
        q.questionType === 'multiple'
            ? 'multiple'
            : q.questionType === 'input'
              ? 'input'
              : q.questionType === 'file'
                ? 'file'
                : 'single',
    options: q.options?.map((o) => o.text),
});

export const mapApiAssignment = (a: ApiAssignment): Assignment => ({
    id: a.id,
    title: a.postType || a.assignmentData || 'Задание',
    subject: '',
    subjectId: a.subjectId,
    status: 'not_started',
    points: 0,
    type: 'test',
    description: a.content || a.assignmentData || '',
    questions: (a.questions ?? []).map(mapApiQuestion),
});

export const mapQuestionToApi = (q: Question): ApiQuestion => ({
    id: q.id,
    questionType: q.type,
    questionData: q.text,
    options: q.options?.map((opt, idx) =>
        typeof opt === 'string'
            ? { id: `${q.id}-${idx}`, text: opt }
            : {
                  id: opt.id ?? `${q.id}-${idx}`,
                  text: typeof opt.text === 'string' ? opt.text : '',
              },
    ),
});

export const makeApiPayloadFromAssignment = (assignment: {
    title: string;
    description: string;
    questions: Question[];
}) => ({
    content: assignment.description,
    assignmentData: assignment.title,
    questions: assignment.questions.map(mapQuestionToApi),
});
