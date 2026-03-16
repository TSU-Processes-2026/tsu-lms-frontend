// src/pages/Assignments/QuizEngine.tsx
import React, { useState } from 'react';
import { CheckCircle, FileUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Question, Option } from '../../types/assignments/assignments';

interface Props {
    questions: Question[];
    initialAnswers: Record<string, any>;
    onAnswerChange: (answers: Record<string, any>) => void;
    onSaveDraft: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export const QuizEngine: React.FC<Props> = ({
    questions,
    initialAnswers,
    onAnswerChange,
    onSaveDraft,
    onSubmit,
    isSubmitting,
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>(initialAnswers);
    const [isFinished, setIsFinished] = useState(false);

    const currentQuestion = questions[currentStep];

    const handleAnswer = (qId: string, value: any) => {
        const newAnswers = { ...answers, [qId]: value };
        setAnswers(newAnswers);
        onAnswerChange(newAnswers);
    };

    const toggleMultiple = (qId: string, optionId: string) => {
        const current = (answers[qId] as string[]) || [];
        const newValue = current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId];
        handleAnswer(qId, newValue);
    };

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setIsFinished(true);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const progress = ((currentStep + 1) / questions.length) * 100;

    if (isFinished) {
        return (
            <div className='flex flex-col items-center justify-center h-full p-10 text-center'>
                <CheckCircle size={80} className='text-emerald-600 mb-8 animate-pulse' />
                <h2 className='text-4xl font-bold text-slate-800 mb-4'>Тест завершён!</h2>
                <p className='text-lg text-slate-600 mb-10 max-w-md'>
                    Вы ответили на все вопросы. Теперь можно сохранить черновик или отправить
                    работу.
                </p>
                <div className='flex flex-col sm:flex-row gap-6 w-full max-w-sm'>
                    <button
                        onClick={onSaveDraft}
                        disabled={isSubmitting}
                        className='flex-1 py-5 px-8 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all disabled:opacity-50'
                    >
                        Сохранить черновик
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className='flex-1 py-5 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all disabled:opacity-50'
                    >
                        {isSubmitting ? 'Отправка...' : 'Отправить на проверку'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='flex flex-col h-full p-6 md:p-10'>
            {/* Progress */}
            <div className='mb-8'>
                <div className='h-2 bg-slate-200 rounded-full overflow-hidden'>
                    <div
                        className='h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500'
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className='flex justify-between text-sm text-slate-500 mt-2'>
                    <span>
                        Вопрос {currentStep + 1} из {questions.length}
                    </span>
                    <span>{Math.round(progress)}%</span>
                </div>
            </div>

            {/* Question */}
            <h2 className='text-2xl md:text-3xl font-bold text-slate-800 mb-8'>
                {currentQuestion.questionData}
            </h2>

            {/* Options */}
            <div className='flex-1 space-y-4 overflow-y-auto'>
                {currentQuestion.questionType === 'SingleChoice' && currentQuestion.options && (
                    <div className='space-y-3'>
                        {currentQuestion.options.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => handleAnswer(currentQuestion.id, opt.id)}
                                className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                                    answers[currentQuestion.id] === opt.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div
                                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                                        answers[currentQuestion.id] === opt.id
                                            ? 'border-blue-600 bg-blue-600'
                                            : 'border-slate-300'
                                    }`}
                                >
                                    {answers[currentQuestion.id] === opt.id && (
                                        <div className='w-3 h-3 bg-white rounded-full' />
                                    )}
                                </div>
                                <span className='font-medium text-lg'>{opt.text}</span>
                            </button>
                        ))}
                    </div>
                )}

                {currentQuestion.questionType === 'MultipleChoice' && currentQuestion.options && (
                    <div className='space-y-3'>
                        {currentQuestion.options.map((opt) => {
                            const selected = (
                                (answers[currentQuestion.id] as string[]) || []
                            ).includes(opt.id);
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => toggleMultiple(currentQuestion.id, opt.id)}
                                    className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                                        selected
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <div
                                        className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center ${
                                            selected
                                                ? 'border-indigo-600 bg-indigo-600'
                                                : 'border-slate-300'
                                        }`}
                                    >
                                        {selected && (
                                            <CheckCircle size={16} className='text-white' />
                                        )}
                                    </div>
                                    <span className='font-medium text-lg'>{opt.text}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {currentQuestion.questionType === 'Text' && (
                    <textarea
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                        placeholder='Введите ваш ответ...'
                        className='w-full h-40 p-6 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-500 resize-none text-lg'
                    />
                )}

                {currentQuestion.questionType === 'File' && (
                    <label className='border-2 border-dashed border-slate-300 rounded-3xl p-12 flex flex-col items-center justify-center bg-slate-50 cursor-pointer'>
                        <FileUp className='text-blue-600 mb-4' size={40} />
                        <p className='font-bold text-slate-800'>Загрузите файл</p>
                        <p className='text-sm text-slate-500'>PDF, DOCX, изображение до 10 МБ</p>
                        <input type='file' className='hidden' />
                    </label>
                )}
            </div>

            {/* Navigation */}
            <div className='mt-10 flex justify-between'>
                <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className='px-6 py-3 bg-slate-100 rounded-2xl disabled:opacity-50'
                >
                    <ChevronLeft className='inline mr-2' size={20} /> Назад
                </button>
                <button
                    onClick={handleNext}
                    className='px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl'
                >
                    {currentStep === questions.length - 1 ? 'Завершить' : 'Далее'}{' '}
                    <ChevronRight className='inline ml-2' size={20} />
                </button>
            </div>
        </div>
    );
};
