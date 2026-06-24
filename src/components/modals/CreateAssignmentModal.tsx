import React, { useEffect } from "react";
import { ClipboardCheck, X, Plus, Trash2, ListChecks, Eye, EyeOff, CalendarClock } from "lucide-react";
import { useCreateAssignmentModal, QuestionType, CriteriaDraft } from '@/hooks/subject/useCreateAssignmentModal';

const CreateAssignmentModal: React.FC<{ subjectId: string; subjectGradingMode?: 'five_point' | 'cumulative'; onGradingModeChange?: (mode: 'five_point' | 'cumulative') => void; onClose: () => void; onCreate: (a: import('@/hooks/subject/useCreateAssignmentModal').CreateAssignmentData) => void }> = ({ subjectId, subjectGradingMode, onGradingModeChange, onClose, onCreate }) => {
  const {
    title, setTitle,
    gradingMode, setGradingMode,
    deadline, setDeadline,
    selfAssessmentEnabled, setSelfAssessmentEnabled,
    selfAssessmentVisibilityDate, setSelfAssessmentVisibilityDate,
    questions, addQuestion, removeQuestion, updateQuestion, updateOption,
    criteria, addCriterion, updateCriterion, removeCriterion,
    handleSubmit, error,
  } = useCreateAssignmentModal(subjectId, onCreate);

  useEffect(() => {
    if (subjectGradingMode) setGradingMode(subjectGradingMode);
  }, [subjectGradingMode, setGradingMode]);

  const handleGradingModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value as 'five_point' | 'cumulative';
    setGradingMode(mode);
    onGradingModeChange?.(mode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50">
              <ClipboardCheck className="text-white" size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Создать тест</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={22} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <div className="space-y-6">

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Название теста</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Тест: Основы алгебры"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  <CalendarClock size={14} /> Дедлайн
                </label>
                <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Самооценка</label>
                <button type="button" onClick={() => setSelfAssessmentEnabled(!selfAssessmentEnabled)}
                  className={`w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all border ${selfAssessmentEnabled ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                  {selfAssessmentEnabled ? <Eye size={16} /> : <EyeOff size={16} />}
                  {selfAssessmentEnabled ? 'Включена' : 'Выключена'}
                </button>
              </div>
            </div>

            {selfAssessmentEnabled && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Дата видимости критериев</label>
                <input type="datetime-local" value={selfAssessmentVisibilityDate} onChange={e => setSelfAssessmentVisibilityDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                <p className="text-xs text-slate-400 mt-1">До этой даты критерии и отправка будут скрыты от студентов.</p>
              </div>
            )}

            <div className="border-t border-slate-200 pt-6">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                  <h4 className="font-bold text-slate-800">Вопросы</h4>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 font-semibold rounded-full text-sm">{questions.length}</span>
                </div>
                <button type="button" onClick={addQuestion}
                  className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all">
                  <Plus size={16} /> Добавить вопрос
                </button>
              </div>
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-bold text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200">Вопрос {idx + 1}</span>
                      <div className="flex items-center gap-3">
                        <select value={q.type} onChange={e => updateQuestion(idx, 'type', e.target.value)}
                          className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg font-semibold outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="single">Одиночный выбор</option>
                          <option value="multiple">Множественный выбор</option>
                          <option value="input">Текстовый ответ</option>
                        </select>
                        {questions.length > 1 && (
                          <button type="button" onClick={() => removeQuestion(idx)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                        )}
                      </div>
                    </div>
                    <input type="text" value={q.text} onChange={e => updateQuestion(idx, 'text', e.target.value)}
                      placeholder="Текст вопроса"
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl mb-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    {(q.type === 'single' || q.type === 'multiple') && q.options && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Варианты ответов:</p>
                        {q.options.map((opt: string, oIdx: number) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <input type={q.type === 'single' ? 'radio' : 'checkbox'}
                              name={`correct-${idx}`}
                              checked={q.type === 'single' ? q.correct === oIdx : Array.isArray(q.correct) && q.correct.includes(oIdx)}
                              onChange={() => {
                                if (q.type === 'single') updateQuestion(idx, 'correct', oIdx);
                                else {
                                  const cur: number[] = Array.isArray(q.correct) ? q.correct : [];
                                  updateQuestion(idx, 'correct', cur.includes(oIdx) ? cur.filter((i: number) => i !== oIdx) : [...cur, oIdx]);
                                }
                              }}
                              className="shrink-0 accent-blue-600 w-4 h-4" />
                            <input type="text" value={opt} onChange={e => updateOption(idx, oIdx, e.target.value)}
                              placeholder={`Вариант ${oIdx + 1}`}
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                        ))}
                      </div>
                    )}
                    {q.type === 'input' && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Правильный ответ:</p>
                        <input type="text" placeholder="Эталонный ответ..."
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                  <ListChecks size={20} className="text-blue-500" />
                  <h4 className="font-bold text-slate-800">Критерии оценивания</h4>
                </div>
                <button type="button" onClick={addCriterion}
                  className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all">
                  <Plus size={16} /> Добавить критерий
                </button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <label className="text-sm font-semibold text-slate-600">Режим расчёта:</label>
                <select value={gradingMode} onChange={handleGradingModeChange} className="border rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="five_point">Пятибалльная (вес)</option>
                  <option value="cumulative">Накопительная (баллы)</option>
                </select>
              </div>
              <div className="space-y-2">
                {criteria.map((c, idx) => (
                  <div key={c.id} className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <input value={c.description} onChange={(e) => updateCriterion(idx, { description: e.target.value })} placeholder="Описание критерия" className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    <select value={c.format} onChange={(e) => updateCriterion(idx, { format: e.target.value as CriteriaDraft['format'] })} className="border rounded-lg px-2 py-2 text-sm bg-white">
                      <option value="checklist">checklist</option>
                      <option value="percentage">percentage</option>
                      <option value="numeric">numeric</option>
                    </select>
                    {gradingMode === 'five_point' ? (
                      <input type="number" value={c.weight} onChange={(e) => updateCriterion(idx, { weight: e.target.value })} placeholder="Вес" className="w-16 px-2 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    ) : (
                      <input type="number" value={c.maxPoints} onChange={(e) => updateCriterion(idx, { maxPoints: e.target.value })} placeholder="Макс" className="w-16 px-2 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    )}
                    <div className="flex items-center gap-1 text-xs shrink-0">
                      <label className="flex items-center gap-0.5 cursor-pointer">
                        <input type="checkbox" checked={c.isBonus} onChange={() => updateCriterion(idx, { isBonus: !c.isBonus })} className="accent-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Бонус</span>
                      </label>
                      <label className="flex items-center gap-0.5 cursor-pointer">
                        <input type="checkbox" checked={c.isPenalty} onChange={() => updateCriterion(idx, { isPenalty: !c.isPenalty })} className="accent-red-600" />
                        <span className="text-red-700 font-semibold">Штраф</span>
                      </label>
                    </div>
                    <button type="button" onClick={() => removeCriterion(idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all shrink-0"><Trash2 size={16} /></button>
                  </div>
                ))}
                {criteria.length === 0 && <p className="text-sm text-slate-400">Критерии не добавлены. Можно добавить позже.</p>}
              </div>
            </div>

          </div>
          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
            <button type="button" onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200">Отмена</button>
            <button type="submit"
              className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200/50 hover:-translate-y-0.5 transition-all">Опубликовать тест</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignmentModal;

