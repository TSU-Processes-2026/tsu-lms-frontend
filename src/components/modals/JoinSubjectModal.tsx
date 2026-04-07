import { useJoinSubject } from '@/hooks/subject/useJoinSubject';
import { AlertCircle, Key, X } from 'lucide-react';

interface JoinModalProps {
    onClose: () => void;
}

export const JoinSubjectModal = ({ onClose }: JoinModalProps) => {
    const { selectedSubject, errorMessage, handleSubmit, handleSelectSubject } =
        useJoinSubject(onClose);

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
            <div className='bg-white w-full max-w-md rounded-3xl shadow-2xl p-8'>
                <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200/50'>
                            <Key className='text-white' size={20} />
                        </div>
                        <h3 className='text-xl font-bold text-slate-800'>Присоединиться</h3>
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
                            Укажите идентификатор предмета
                        </label>
                        <input
                            value={selectedSubject}
                            onChange={handleSelectSubject}
                            className='px-3 py-2 w-full bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500'
                            required
                        ></input>
                        {errorMessage && (
                            <p className='text-red-500 text-sm mt-2 flex items-center gap-1'>
                                <AlertCircle size={14} /> {errorMessage}
                            </p>
                        )}
                    </div>

                    <div className='p-4 bg-blue-50 rounded-xl border border-blue-100'>
                        <p className='text-xs text-blue-700 font-semibold mb-1'>
                            ℹ️ Идентификатор предмета
                        </p>
                        <p className='text-xs text-blue-600'>
                            Для получения <span className='font-bold'>идентификатора</span>.
                            свяжитесь с преподавателем.
                        </p>
                        <br />
                        <p className='text-xs text-blue-700 font-semibold mb-1'>
                            ℹ️ Роль в предмете
                        </p>
                        <p className='text-xs text-blue-600'>
                            Вы присоединитесь как <span className='font-bold'>обучающийся</span>.
                            Администратор предмета может изменить вашу роль после вступления.
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
                            className='flex-1 bg-linear-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-200/50 hover:-translate-y-0.5 transition-all'
                        >
                            Присоединиться
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
