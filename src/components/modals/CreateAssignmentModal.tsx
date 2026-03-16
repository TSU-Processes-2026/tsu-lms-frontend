import React from "react";
import { ClipboardCheck, X, Plus, Trash2 } from "lucide-react";
import { useCreateAssignmentModal, QuestionType } from '@/hooks/subject/useCreateAssignmentModal';

/**
 * CreateAssignmentModal component for creating a test assignment with dynamic questions.
 *
 * @param props Component props.
 * @property subjectId The subject identifier for the assignment.
 * @property onClose Handler to close the modal.
 * @property onCreate Handler to create the assignment with provided data.
 * @returns Modal window for creating a test assignment.
 *
 * @throws {Error} If form submission fails.
 */
const CreateAssignmentModal: React.FC<{ subjectId: string; onClose: () => void; onCreate: (a: { id: string; title: string; questions: QuestionType[]; subjectId: string; type: string; status: string; subject: string }) => void }> = ({ subjectId, onClose, onCreate }) => {
  const {
    title,
    setTitle,
    questions,
    addQuestion,
    removeQuestion,
    updateQuestion,
    updateOption,
    handleSubmit,
  } = useCreateAssignmentModal(subjectId, onCreate);

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
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Название теста</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Тест: Основы алгебры"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                  <h4 className="font-bold text-slate-800">Вопросы</h4>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 font-semibold rounded-full text-sm ml-2">
                    {questions.length} вопрос{questions.length === 1 ? '' : questions.length < 5 ? 'а' : 'ов'}
                  </span>
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
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={16} />
                          </button>
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
                              checked={q.type === 'single' ? q.correct === oIdx : Array.isArray(q.correct) && Array.isArray(q.correct) && q.correct.includes(oIdx)}
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
                        <p className="text-[10px] text-slate-400 mt-1">
                          {q.type === 'single' ? '☝️ Выберите правильный ответ' : '☝️ Отметьте все правильные ответы'}
                        </p>
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
          </div>

          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
            <button type="button" onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200">
              Отмена
            </button>
            <button type="submit"
              className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200/50 hover:-translate-y-0.5 transition-all">
              Опубликовать тест
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignmentModal;

