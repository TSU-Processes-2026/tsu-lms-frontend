import { Question, AnswerItemDto } from '../types/assignments/assignments';

export const transformAnswersToApi = (
    questions: Question[],
    userAnswers: Record<string, any>,
): { answers: AnswerItemDto[] } => {
    return {
        answers: questions.map((q) => {
            const value = userAnswers[q.id];

            switch (q.questionType) {
                case 'SingleChoice':
                    return {
                        id: crypto.randomUUID(),
                        assignmentQuestionId: q.id,
                        answerType: 0 as const,
                        selectedOptionId: value || null,
                        selectedOptionIds: null,
                        text: null,
                    };
                case 'MultipleChoice':
                    return {
                        id: crypto.randomUUID(),
                        assignmentQuestionId: q.id,
                        answerType: 1 as const,
                        selectedOptionId: null,
                        selectedOptionIds: Array.isArray(value) ? value : [],
                        text: null,
                    };
                default:
                    return {
                        id: crypto.randomUUID(),
                        assignmentQuestionId: q.id,
                        answerType: 2 as const,
                        selectedOptionId: null,
                        selectedOptionIds: null,
                        text: typeof value === 'string' ? value : '',
                    };
            }
        }),
    };
};
