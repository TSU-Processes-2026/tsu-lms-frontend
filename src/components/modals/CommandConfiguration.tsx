import { useCommandConfig } from '@/hooks/command/useCommandConfig';
import { warningMessageMapper } from '@/utils/messageMapper';
import { Plus, X } from 'lucide-react';
import { useParams } from 'react-router-dom';

interface ModalProps {
    participantsCount: number;
    subjectId: string;
    onClose: () => void;
}

export const CommandConfiguration = ({ participantsCount, subjectId, onClose }: ModalProps) => {
    const {
        config,
        errorMessage,
        isLoading,
        isSuccess,
        segregationType,
        handleSubmit,
        handleDistributionMode,
        handleSegregationType,
        handleMinSize,
        handleMaxSize,
        handleTeamSize,
        handleTeamsCount,
    } = useCommandConfig(subjectId, participantsCount, onClose);
    if (isLoading) {
        return (
            <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
                <div className='bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8'>
                    <div className='flex items-center justify-between mb-6'>
                        <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-300/50'>
                                <Plus className='text-white' size={20} />
                            </div>
                            <h3 className='text-xl font-bold text-slate-800'>
                                Параметры создания команд
                            </h3>
                        </div>

                        <button
                            onClick={onClose}
                            className='p-2 hover:bg-slate-100 rounded-full transition-colors'
                        >
                            <X size={22} className='text-slate-400' />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className='space-y-5'>
                        <div>Загрузка</div>

                        <div className='p-4 bg-blue-50 border-b-blue-50 rounded-xl border border-blue-100'>
                            <p className='text-xs text-blue-700 font-semibold mb-1'>
                                ℹ️ После сохранения
                            </p>
                            <p className='text-xs text-blue-600'>
                                Указанные параметры будут использованы при формировании команд.
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
                                disabled={true}
                                className='flex-1 bg-linear-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-300/150 hover:-translate-y-0.5 transition-all'
                            >
                                Сохранить
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
            <div className='bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8'>
                <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-300/50'>
                            <Plus className='text-white' size={20} />
                        </div>
                        <h3 className='text-xl font-bold text-slate-800'>
                            Параметры создания команд
                        </h3>
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
                            Выберите режим
                        </label>
                        <select
                            value={config.distributionMode}
                            onChange={(e) => handleDistributionMode(e)}
                            className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer'
                            style={{
                                backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                                backgroundPosition: 'right 1rem center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '1.5em 1.5em',
                                paddingRight: '2.5rem',
                            }}
                        >
                            <option value='0'>Ручное</option>
                            <option value='1'>Случайное</option>
                        </select>
                    </div>
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>
                            Количество команд
                        </label>
                        <input
                            type='number'
                            value={config.fixedTeamsCount}
                            onChange={(e) => handleTeamsCount(e.target.value)}
                            min={1}
                            className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>
                            Выберите способ разделения по числу студентов в команде
                        </label>
                        <select
                            value={segregationType}
                            onChange={(e) => handleSegregationType(e)}
                            className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer'
                            style={{
                                backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                                backgroundPosition: 'right 1rem center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '1.5em 1.5em',
                                paddingRight: '2.5rem',
                            }}
                        >
                            <option value='fixed'>Фиксированное</option>
                            <option value='range'>Задать диапазон</option>
                        </select>
                    </div>
                    {segregationType === 'fixed' &&
                        Number.parseInt(config.fixedTeamsCount.toString()) > 0 && (
                            <div>
                                <label className='block text-sm font-semibold text-slate-700 mb-2'>
                                    Студентов в команде
                                </label>
                                <input
                                    type='number'
                                    value={config.fixedTeamSize ?? ''}
                                    onChange={(e) => handleTeamSize(e.target.value)}
                                    min={1}
                                    className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                                />
                            </div>
                        )}
                    {segregationType === 'range' && (
                        <div className='w-full flex flex-col items-start justify-between'>
                            <label className='block text-sm font-semibold text-slate-700 mb-2'>
                                Диапазон студентов в команде
                            </label>
                            <div className='flex flex-row items-center justify-between gap-4'>
                                <div className='flex flex-row items-center gap-4'>
                                    <label className='block text-sm font-semibold text-slate-700 mb-2'>
                                        От
                                    </label>
                                    <input
                                        type='number'
                                        value={config.minTeamSize ?? ''}
                                        placeholder='От'
                                        onChange={(e) => handleMinSize(e.target.value)}
                                        min={1}
                                        className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                                    />
                                </div>
                                <div className='flex flex-row items-center gap-4'>
                                    <label className='block text-sm font-semibold text-slate-700 mb-2'>
                                        До
                                    </label>
                                    <input
                                        type='number'
                                        value={config.maxTeamSize ?? ''}
                                        placeholder='До'
                                        onChange={(e) => handleMaxSize(e.target.value)}
                                        min={1}
                                        className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {errorMessage && (
                        <div className='p-4 bg-red-50 border-b-red-50 rounded-xl border border-red-100'>
                            <p className='text-xs text-red-700 font-semibold mb-1'>❌ Ошибка</p>
                            <p className='text-xs text-red-600'>{errorMessage}</p>
                        </div>
                    )}
                    {config.warnings.length > 0 && (
                        <div className='p-4 bg-orange-50 border-b-orange-50 rounded-xl border border-orange-100'>
                            <p className='text-xs text-amber-700 font-semibold mb-1'>⚠️ Внимание</p>
                            <p className='text-xs text-amber-600'>
                                {warningMessageMapper(config.warnings).map((warn) => warn + '\n')}
                            </p>
                        </div>
                    )}
                    {isSuccess && (
                        <div className='p-4 bg-green-50 border-b-green-50 rounded-xl border border-green-100'>
                            <p className='text-xs text-green-700 font-semibold mb-1'>✅ Успех</p>
                            <p className='text-xs text-green-600'>
                                {'Конфигурация обновлена успешно'}
                            </p>
                        </div>
                    )}
                    <div className='p-4 bg-blue-50 border-b-blue-50 rounded-xl border border-blue-100'>
                        <p className='text-xs text-blue-700 font-semibold mb-1'>
                            ℹ️ После сохранения
                        </p>
                        <p className='text-xs text-blue-600'>
                            Указанные параметры будут использованы при формировании команд.
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
                            className='flex-1 bg-linear-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-300/150 hover:-translate-y-0.5 transition-all'
                        >
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
