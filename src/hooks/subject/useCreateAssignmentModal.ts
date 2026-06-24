import React, { useState } from "react";

export type QuestionType = {
  id: string;
  type: 'single' | 'multiple' | 'input';
  text: string;
  options?: string[];
  correct?: number | number[];
};

export type CriteriaDraft = {
  id: string;
  description: string;
  format: 'checklist' | 'percentage' | 'numeric';
  weight: string;
  maxPoints: string;
  isBonus: boolean;
  isPenalty: boolean;
};

export type CreateAssignmentData = {
  id: string;
  title: string;
  questions: QuestionType[];
  criteria: CriteriaDraft[];
  subjectId: string;
  type: string;
  status: string;
  subject: string;
  deadline?: string;
  selfAssessmentEnabled: boolean;
  selfAssessmentVisibilityDate?: string;
  gradingMode: 'five_point' | 'cumulative';
};

export function useCreateAssignmentModal(subjectId: string, onCreate: (a: CreateAssignmentData) => void) {
  const [title, setTitle] = useState("");
  const [gradingMode, setGradingMode] = useState<'five_point' | 'cumulative'>('five_point');
  const [deadline, setDeadline] = useState("");
  const [selfAssessmentEnabled, setSelfAssessmentEnabled] = useState(false);
  const [selfAssessmentVisibilityDate, setSelfAssessmentVisibilityDate] = useState("");
  const [questions, setQuestions] = useState<QuestionType[]>([
    { id: "q1", type: "single", text: "", options: ["", "", "", ""], correct: 0 }
  ]);
  const [criteria, setCriteria] = useState<CriteriaDraft[]>([]);
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

  const addCriterion = (): void => {
    setCriteria([...criteria, { id: "c" + Date.now(), description: "", format: "checklist", weight: "1", maxPoints: "5", isBonus: false, isPenalty: false }]);
  };

  const updateCriterion = (idx: number, patch: Partial<CriteriaDraft>): void => {
    setCriteria((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  };

  const removeCriterion = (idx: number): void => setCriteria(criteria.filter((_, i) => i !== idx));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    (async () => {
      try {
        onCreate({
          id: "a" + Date.now(), title,
          deadline: deadline || undefined,
          selfAssessmentEnabled,
          selfAssessmentVisibilityDate: selfAssessmentVisibilityDate || undefined,
          gradingMode,
          questions, criteria, subjectId, type: "test", status: "not_started", subject: "Предмет"
        });
      } catch {
        setError('Ошибка создания теста');
      }
    })();
  };

  return {
    title,
    setTitle,
    gradingMode,
    setGradingMode,
    deadline,
    setDeadline,
    selfAssessmentEnabled,
    setSelfAssessmentEnabled,
    selfAssessmentVisibilityDate,
    setSelfAssessmentVisibilityDate,
    questions,
    addQuestion,
    removeQuestion,
    updateQuestion,
    updateOption,
    criteria,
    addCriterion,
    updateCriterion,
    removeCriterion,
    handleSubmit,
    error,
  };
}
