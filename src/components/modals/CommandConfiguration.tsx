import { useCommandConfig } from '@/hooks/command/useCommandConfig';
import { TeamDistributionMode } from '@/types/command/CommandConfig';
import { warningMessageMapper } from '@/utils/messageMapper';
import { distributionModeLabels } from '@/utils/teamConfig';
import { Plus, X } from 'lucide-react';

interface ModalProps {
    participantsCount: number;
    subjectId: string;
    onClose: () => void;
}

interface ConfigModalProps extends ModalProps {
    role: string;
}

const modeOptions: TeamDistributionMode[] = ['Draft', 'Random', 'Students', 'Manual'];
const toInputDateTime = (value: string | null): string => {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
        return value;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60_000);
    return localDate.toISOString().slice(0, 16);
};

export const CommandConfiguration = (props: ConfigModalProps) => {
    const { subjectId, participantsCount, role, onClose } = props;
    const {
        config,
        isLoading,
        isSuccess,
        segregationType,
        errorMessage,
        handleDistributionMode,
        handleMaxSize,
        handleMinSize,
        handleSegregationType,
        handleSubmit,
        handleTeamSize,
        handleTeamsCount,
        handleCaptainEnabled,
        handleFinalDecisionThreshold,
        handleCaptainVotingDeadline,
        handleFinalDecisionDeadline,
    } = useCommandConfig(subjectId ?? '', participantsCount, role);

    const mode = config.distributionMode;
    const isDraftMode = mode === 'Draft';
    const isCaptainVotingMode = mode === 'Random' || mode === 'Manual';
    const isFinalized = config.isFinalized;

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
                    <div className='text-center py-8 text-gray-500'>Загрузка...</div>
                </div>
            </div>
        );
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-scroll'>
            <div className='bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-y-hidden '>
                <div className='flex items-center justify-between m-6'>
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
                <form onSubmit={handleSubmit} className='space-y-5 flex-1 overflow-y-auto px-4'>
                    {isFinalized && (
                        <div className='p-4 bg-amber-50 border border-amber-100 rounded-xl'>
                            <p className='text-xs text-amber-700 font-semibold mb-1'>
                                Команды финализированы
                            </p>
                            <p className='text-xs text-amber-600'>
                                Изменение параметров и капитанов после финализации запрещено.
                            </p>
                        </div>
                    )}
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>
                            Выберите режим формирования
                        </label>
                        <select
                            value={mode}
                            onChange={handleDistributionMode}
                            disabled={isFinalized}
                            className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer'
                        >
                            {modeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {distributionModeLabels[option]}
                                </option>
                            ))}
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
                            disabled={isFinalized}
                            className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>
                            Способ задания размера команды
                        </label>
                        <select
                            value={segregationType}
                            onChange={handleSegregationType}
                            disabled={isFinalized}
                            className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer'
                        >
                            <option value='fixed'>Фиксированное число студентов в команде</option>
                            <option value='range'>Диапазон численности команд</option>
                        </select>
                    </div>
                    {segregationType === 'fixed' && (
                        <div>
                            <label className='block text-sm font-semibold text-slate-700 mb-2'>
                                Студентов в команде
                            </label>
                            <input
                                type='number'
                                value={config.fixedTeamSize ?? ''}
                                onChange={(e) => handleTeamSize(e.target.value)}
                                min={1}
                                disabled={isFinalized}
                                className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                            />
                        </div>
                    )}
                    {segregationType === 'range' && (
                        <div className='w-full flex flex-col items-start justify-between'>
                            <label className='block text-sm font-semibold text-slate-700 mb-2'>
                                Диапазон студентов в команде
                            </label>
                            <div className='flex flex-row items-center justify-between gap-4 w-full'>
                                <div className='flex flex-row items-center gap-4 w-full'>
                                    <label className='block text-sm font-semibold text-slate-700 mb-2'>
                                        От
                                    </label>
                                    <input
                                        type='number'
                                        value={config.minTeamSize ?? ''}
                                        placeholder='От'
                                        onChange={(e) => handleMinSize(e.target.value)}
                                        min={1}
                                        disabled={isFinalized}
                                        className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                                    />
                                </div>
                                <div className='flex flex-row items-center gap-4 w-full'>
                                    <label className='block text-sm font-semibold text-slate-700 mb-2'>
                                        До
                                    </label>
                                    <input
                                        type='number'
                                        value={config.maxTeamSize ?? ''}
                                        placeholder='До'
                                        onChange={(e) => handleMaxSize(e.target.value)}
                                        min={1}
                                        disabled={isFinalized}
                                        className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <div className='p-4 bg-slate-50 rounded-xl border border-slate-200'>
                        <div className='flex items-center justify-between gap-3'>
                            <div>
                                <p className='text-sm font-semibold text-slate-700'>
                                    Капитан команды
                                </p>
                                <p className='text-xs text-slate-500'>
                                    {isDraftMode
                                        ? 'В режиме драфта капитан обязателен'
                                        : 'Можно отключить, если решение принимается голосованием'}
                                </p>
                            </div>
                            <input
                                type='checkbox'
                                checked={config.captainEnabled}
                                disabled={isDraftMode || isFinalized}
                                onChange={(e) => handleCaptainEnabled(e.target.checked)}
                                className='h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60'
                            />
                        </div>
                        <div className='mt-3 text-xs text-slate-600'>
                            <p>
                                Способ выбора капитана:{' '}
                                <span className='font-semibold'>
                                    {config.captainEnabled
                                        ? isCaptainVotingMode
                                            ? 'Голосование команды'
                                            : 'Ручное назначение преподавателем'
                                        : 'Капитан отключен'}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>
                            Дедлайн голосования за капитана
                        </label>
                        <input
                            type='datetime-local'
                            value={toInputDateTime(config.captainVotingDeadline)}
                            onChange={(e) => handleCaptainVotingDeadline(e.target.value)}
                            disabled={isFinalized || !config.captainEnabled || !isCaptainVotingMode}
                            className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-60'
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>
                            Порог финального решения (1..{Math.max(1, participantsCount)})
                        </label>
                        <input
                            type='number'
                            value={config.finalDecisionThreshold ?? ''}
                            onChange={(e) => handleFinalDecisionThreshold(e.target.value)}
                            min={1}
                            max={Math.max(1, participantsCount)}
                            disabled={isFinalized}
                            className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>
                            Дедлайн итогового решения
                        </label>
                        <input
                            type='datetime-local'
                            value={toInputDateTime(config.finalDecisionDeadline)}
                            onChange={(e) => handleFinalDecisionDeadline(e.target.value)}
                            disabled={isFinalized}
                            className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-60'
                        />
                    </div>

                    <div className='p-4 bg-blue-50 border-b-blue-50 rounded-xl border border-blue-100'>
                        <p className='text-xs text-blue-700 font-semibold mb-1'>
                            Метод принятия решения
                        </p>
                        <p className='text-xs text-blue-600'>
                            {config.captainEnabled
                                ? 'Выбор капитана (капитан принимает финальное решение)'
                                : 'Голосование участников команды'}
                        </p>
                    </div>

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
                            <p className='text-xs text-green-600'>Конфигурация обновлена успешно</p>
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
                </form>
                <div className='px-8 py-5 border-t border-slate-100 flex justify-start gap-4 bg-slate-50/50 shrink-0'>
                    <button
                        type='button'
                        onClick={onClose}
                        className='flex-1 px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200'
                    >
                        Отмена
                    </button>
                    <button
                        type='submit'
                        disabled={isFinalized}
                        onClick={handleSubmit}
                        className='flex-1 bg-linear-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-300/150 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed'
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
};
