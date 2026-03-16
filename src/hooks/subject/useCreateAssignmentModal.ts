import React, { useState } from "react";

/**
 * useCreateAssignmentModal hook manages business logic for CreateAssignmentModal.
 *
 * @param subjectId The subject identifier for the assignment.
 * @param onCreate Handler to create the assignment with provided data.
 * @returns State and handlers for modal form.
 *
 * @throws {Error} If form submission fails.
 */
export type QuestionType = {
  id: string;
  type: 'single' | 'multiple' | 'input';
  text: string;
  options?: string[];
  correct?: number | number[];
};

export function useCreateAssignmentModal(subjectId: string, onCreate: (a: { id: string; title: string; questions: QuestionType[]; subjectId: string; type: string; status: string; subject: string }) => void) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionType[]>([
    { id: "q1", type: "single", text: "", options: ["", "", "", ""], correct: 0 }
  ]);
  const [error, setError] = useState<string | null>(null);

  const addQuestion = (): void => {
    setQuestions([...questions, { id: "q" + (questions.length + 1), type: "single", text: "", options: ["", "", "", ""], correct: 0 }]);
  };

  const removeQuestion = (idx: number): void => setQuestions(questions.filter((_, i) => i !== idx));

  const updateQuestion = (idx: number, field: keyof QuestionType, value: string | number | number[]): void => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIdx: number, oIdx: number, value: string): void => {
    const updated = [...questions];
    const opts = updated[qIdx].options ? [...updated[qIdx].options!] : [];
    opts[oIdx] = value;
    updated[qIdx] = { ...updated[qIdx], options: opts };
    setQuestions(updated);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    (async () => {
      try {
        onCreate({
          id: "a" + Date.now(), title,
          questions, subjectId, type: "test", status: "not_started", subject: "Предмет"
        });
      } catch {
        setError('Ошибка создания теста');
      }
    })();
  };

  return {
    title,
    setTitle,
    questions,
    addQuestion,
    removeQuestion,
    updateQuestion,
    updateOption,
    handleSubmit,
    error,
  };
}
