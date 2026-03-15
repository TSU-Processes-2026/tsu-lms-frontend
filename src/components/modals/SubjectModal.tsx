import { useCreateSubject } from '@/hooks/subject/useCreateSubject';
import { Plus, X } from 'lucide-react';

interface ModalProps {
    onClose: () => void;
    onCreate: (s: any) => void;
}

export const CreateSubjectModal = ({ onClose, onCreate }: ModalProps) => {
    const { title, description, errorMessage, handleSubmit, setTitle, setDescription } =
        useCreateSubject(onClose);

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
            <div className='bg-white w-full max-w-md rounded-3xl shadow-2xl p-8'>
                <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-300/50'>
                            <Plus className='text-white' size={20} />
                        </div>
                        <h3 className='text-xl font-bold text-slate-800'>Создать предмет</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className='p-2 hover:bg-slate-100 rounded-full transition-colors'
                    >
                        <X size={22} className='text-slate-400' />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className='space-y-5'>
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>
                            Название предмета
                        </label>
                        <input
                            type='text'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder='Математика'
                            className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>
                            Описание
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder='Краткое описание предмета...'
                            className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all'
                            rows={3}
                        />
                    </div>
                    {errorMessage && (
                        <div className='p-4 bg-red-50 border-b-red-50 rounded-xl border border-red-100'>
                            <p className='text-xs text-red-700 font-semibold mb-1'>❌ Ошибка</p>
                            <p className='text-xs text-red-600'>{errorMessage}</p>
                        </div>
                    )}
                    <div className='p-4 bg-blue-50 border-b-blue-50 rounded-xl border border-blue-100'>
                        <p className='text-xs text-blue-700 font-semibold mb-1'>
                            ℹ️ После создания
                        </p>
                        <p className='text-xs text-blue-600'>
                            Вы автоматически станете администратором предмета.
                        </p>
                    </div>
                    <div className='flex gap-3 pt-2'>
                        <button
                            type='button'
                            onClick={onClose}
                            className='flex-1 px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200'
                        >
                            Отмена
                        </button>
                        <button
                            type='submit'
                            className='flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-300/50 hover:-translate-y-0.5 transition-all'
                        >
                            Создать
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
