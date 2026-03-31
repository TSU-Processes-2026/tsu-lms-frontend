import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Assignment, Question, Option } from '../../types/assignments/assignments';
import { makeApiPayloadFromAssignment, mapApiAssignment } from './assignmentApi';

interface Props {
    subjectId: string;
    token: string;
    assignment?: Assignment;
    onClose: () => void;
    onSave: (assignment: Assignment) => void;
}

const newOption = (): Option => ({
    id: Math.random().toString(36).slice(2),
    text: '',
});

const defaultQuestion = (): Question => ({
    id: Math.random().toString(36).slice(2),
    questionType: 'SingleChoice',
    questionData: '',
    options: [newOption()],
});

export const AssignmentEditorModal: React.FC<Props> = ({
    subjectId,
    token,
    assignment,
    onClose,
    onSave,
}) => {
    const [title, setTitle] = useState(assignment?.content.split('\n')[0] || '');
    const [description, setDescription] = useState(
        assignment?.content.split('\n').slice(1).join('\n') || '',
    );
    const [questions, setQuestions] = useState<Question[]>(
        assignment?.questions ?? [defaultQuestion()],
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (assignment) {
            setTitle(assignment.content.split('\n')[0] || '');
            setDescription(assignment.content.split('\n').slice(1).join('\n') || '');
            setQuestions(assignment.questions.length ? assignment.questions : [defaultQuestion()]);
        }
    }, [assignment]);

    const canSave = title.trim().length > 0;

    const handleSave = async () => {
        if (!canSave) return;
        setLoading(true);
        setError(null);

        const payload = makeApiPayloadFromAssignment({
            content: `${title.trim()}\n${description.trim()}`.trim(),
            assignmentData: null,
            questions,
        });

        try {
            const url = assignment
                ? `/api/assignments/${assignment.id}`
                : `/api/subjects/${subjectId}/assignments`;
            const method = assignment ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Ошибка при сохранении задания');
            }

            const data = await res.json();
            const mapped = mapApiAssignment(data);
            onSave(mapped);
            onClose();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const updateQuestion = (idx: number, patch: Partial<Question>) => {
        setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
    };

    const addQuestion = () => {
        setQuestions((prev) => [...prev, defaultQuestion()]);
    };

    const removeQuestion = (idx: number) => {
        setQuestions((prev) => prev.filter((_, i) => i !== idx));
    };

    const updateOption = (qIdx: number, optIdx: number, value: string) => {
        setQuestions((prev) =>
            prev.map((q, i) => {
                if (i !== qIdx) return q;
                const options = q.options ? [...q.options] : [];
                const target = options[optIdx];
                options[optIdx] = { ...target, text: value };
                return { ...q, options };
            }),
        );
    };

    const addOption = (qIdx: number) => {
        setQuestions((prev) =>
            prev.map((q, i) =>
                i !== qIdx ? q : { ...q, options: [...(q.options ?? []), newOption()] },
            ),
        );
    };

    const removeOption = (qIdx: number, optIdx: number) => {
        setQuestions((prev) =>
            prev.map((q, i) => {
                if (i !== qIdx) return q;
                const options = q.options ? q.options.filter((_, idx) => idx !== optIdx) : [];
                return { ...q, options };
            }),
        );
    };

    const modalTitle = assignment ? 'Редактировать задание' : 'Создать задание';

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-slate-900/60 backdrop-blur-sm' onClick={onClose} />
            <div className='bg-white w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] shadow-2xl z-10 flex flex-col overflow-hidden'>
                <div className='px-8 py-6 border-b flex justify-between items-center bg-slate-50/30'>
                    <h3 className='text-xl font-bold'>{modalTitle}</h3>
                    <button onClick={onClose} aria-label='Закрыть'>
                        <X size={24} />
                    </button>
                </div>

                <div className='p-8 overflow-y-auto'>
                    <div className='space-y-6'>
                        <div>
                            <label className='block text-sm font-medium text-slate-700'>
                                Название
                            </label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className='mt-2 w-full rounded-2xl border border-slate-200 p-4 focus:outline-none focus:border-blue-500'
                                placeholder='Название задания'
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-slate-700'>
                                Описание
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className='mt-2 w-full rounded-2xl border border-slate-200 p-4 min-h-[120px] focus:outline-none focus:border-blue-500'
                                placeholder='Пояснение, что нужно сделать'
                            />
                        </div>

                        <div>
                            <div className='flex items-center justify-between'>
                                <h4 className='text-lg font-semibold'>Вопросы</h4>
                                <button
                                    type='button'
                                    onClick={addQuestion}
                                    className='text-sm text-blue-600 hover:underline'
                                >
                                    + Добавить вопрос
                                </button>
                            </div>

                            <div className='space-y-4 mt-4'>
                                {questions.map((q, qIdx) => (
                                    <div
                                        key={q.id}
                                        className='border border-slate-200 rounded-2xl p-4'
                                    >
                                        <div className='flex items-start justify-between gap-2'>
                                            <div className='flex-1'>
                                                <label className='block text-sm font-medium text-slate-700'>
                                                    Текст вопроса
                                                </label>
                                                <input
                                                    value={q.questionData}
                                                    onChange={(e) =>
                                                        updateQuestion(qIdx, {
                                                            questionData: e.target.value,
                                                        })
                                                    }
                                                    className='mt-2 w-full rounded-2xl border border-slate-200 p-3 focus:outline-none focus:border-blue-500'
                                                    placeholder='Например: 2+2 = ?'
                                                />
                                            </div>
                                            <button
                                                type='button'
                                                onClick={() => removeQuestion(qIdx)}
                                                className='text-sm text-red-600 hover:underline'
                                            >
                                                Удалить
                                            </button>
                                        </div>

                                        <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-4'>
                                            <div>
                                                <label className='block text-sm font-medium text-slate-700'>
                                                    Тип
                                                </label>
                                                <select
                                                    value={q.questionType}
                                                    onChange={(e) =>
                                                        updateQuestion(qIdx, {
                                                            questionType: e.target
                                                                .value as Question['questionType'],
                                                        })
                                                    }
                                                    className='mt-2 w-full rounded-2xl border border-slate-200 p-3 focus:outline-none focus:border-blue-500'
                                                >
                                                    <option value='SingleChoice'>Один вариант</option>
                                                    <option value='MultipleChoice'>Несколько вариантов</option>
                                                    <option value='Text'>Текст</option>
                                                    <option value='File'>Файл</option>
                                                </select>
                                            </div>
                                        </div>

                                        {(q.questionType === 'SingleChoice' ||
                                            q.questionType === 'MultipleChoice') && (
                                            <div className='mt-4'>
                                                <label className='block text-sm font-medium text-slate-700'>
                                                    Варианты ответа
                                                </label>
                                                <div className='space-y-2 mt-2'>
                                                    {(q.options ?? []).map((opt, optIdx) => (
                                                        <div key={opt.id} className='flex gap-2'>
                                                            <input
                                                                value={opt.text}
                                                                onChange={(e) =>
                                                                    updateOption(
                                                                        qIdx,
                                                                        optIdx,
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                className='flex-1 rounded-2xl border border-slate-200 p-3 focus:outline-none focus:border-blue-500'
                                                            />
                                                            <button
                                                                type='button'
                                                                onClick={() => removeOption(qIdx, optIdx)}
                                                                className='text-sm text-red-600 hover:underline'
                                                            >
                                                                Удалить
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type='button'
                                                        onClick={() => addOption(qIdx)}
                                                        className='text-sm text-blue-600 hover:underline'
                                                    >
                                                        + Добавить вариант
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {error && <p className='text-sm text-red-500'>{error}</p>}

                        <div className='flex justify-end gap-3'>
                            <button
                                onClick={onClose}
                                className='px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all'
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!canSave || loading}
                                className='px-6 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50'
                            >
                                {loading ? 'Сохранение...' : 'Сохранить'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
