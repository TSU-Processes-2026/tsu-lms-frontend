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
        handleRequiresCaptain,
        handleRequiresDecision,
        handleCaptainVotingDeadlineDays,
        handleCaptainSelectionMode,
        handleDecisionDeadlineDays,
        handleRequiredDecisionVotes,
    } = useCommandConfig(subjectId ?? '', participantsCount, role);

    const mode = config.distributionMode;
    const isDraftMode = mode === 'Draft';
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
                                        value={config.minTeamSize ?? 1}
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
                                        value={config.maxTeamSize ?? 2}
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
                                    Включить назначение капитанов в команды
                                </p>
                                <p className='text-xs text-slate-500'>
                                    {isDraftMode
                                        ? 'В режиме Draft капитан обязателен'
                                        : 'Можно отключить, если решение принимается голосованием'}
                                </p>
                            </div>
                            <input
                                type='checkbox'
                                checked={config.requiresCaptain}
                                disabled={isDraftMode || isFinalized}
                                onChange={(e) => handleRequiresCaptain(e.target.checked)}
                                className='h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60'
                            />
                        </div>

                        <div className='mt-3 text-xs text-slate-600'>
                            <p>
                                Способ выбора капитана:{' '}
                                <span className='font-semibold'>
                                    {config.requiresCaptain
                                        ? config.captainSelectionMode == 'Voting'
                                            ? 'Голосование команды'
                                            : 'Ручное назначение преподавателем'
                                        : 'Капитан отключен'}
                                </span>
                            </p>
                        </div>
                    </div>

                    {config.requiresCaptain &&
                        config.distributionMode !== 'Manual' &&
                        config.distributionMode !== 'Random' && (
                            <div>
                                <label className='block text-sm font-semibold text-slate-700 mb-2'>
                                    Способ назначения капитана
                                </label>
                                <select
                                    value={config.captainSelectionMode ?? ''}
                                    onChange={handleCaptainSelectionMode}
                                    disabled={isFinalized}
                                    className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer'
                                >
                                    <option value='Manual'>Назначить самому</option>
                                    <option value='Voting'>Голосованием</option>
                                </select>
                            </div>
                        )}
                    {config.captainSelectionMode === 'Voting' && (
                        <div>
                            <label className='block text-sm font-semibold text-slate-700 mb-2'>
                                Срок голосования за капитана, дней
                            </label>
                            <input
                                type='number'
                                value={config.captainVotingDeadlineDays ?? ''}
                                onChange={(e) => handleCaptainVotingDeadlineDays(e.target.value)}
                                min={1}
                                disabled={isFinalized || !config.requiresCaptain}
                                className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-60'
                            />
                        </div>
                    )}
                    <div className={`p-4 bg-slate-50 rounded-xl border border-slate-200`}>
                        <div className='flex items-center justify-between gap-3'>
                            <div>
                                <p
                                    className={
                                        config.requiresCaptain
                                            ? `text-sm font-semibold text-slate-400`
                                            : `text-sm font-semibold text-slate-700`
                                    }
                                >
                                    Требуется выбор итогового решения
                                </p>
                                <p
                                    className={
                                        config.requiresCaptain
                                            ? `text-xs text-slate-400`
                                            : `text-xs text-slate-500`
                                    }
                                >
                                    {config.requiresCaptain
                                        ? 'Назначен капитан. Итоговое решение принимает капитан команды'
                                        : 'Если выключено, команда может отправлять решения без внутреннего согласования'}
                                </p>
                            </div>
                            <input
                                type='checkbox'
                                checked={config.requiresDecision && !config.requiresCaptain}
                                disabled={isFinalized || config.requiresCaptain}
                                onChange={(e) => {
                                    handleRequiresDecision(e.target.checked);
                                }}
                                className='h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60'
                            />
                        </div>
                    </div>
                    {config.requiresDecision && (
                        <div className='space-y-4'>
                            <div>
                                <label className='block text-sm font-semibold text-slate-700 mb-2'>
                                    Срок выбора итогового решения, дней
                                </label>
                                <input
                                    type='number'
                                    value={config.decisionDeadlineDays ?? ''}
                                    onChange={(e) => handleDecisionDeadlineDays(e.target.value)}
                                    min={1}
                                    disabled={isFinalized}
                                    className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-60'
                                />
                            </div>
                            {config.decisionMode === 'Voting' && (
                                <div>
                                    <label className='block text-sm font-semibold text-slate-700 mb-2'>
                                        Количество голосов для выбора решения при голосовании
                                    </label>
                                    <input
                                        type='number'
                                        value={config.requiredDecisionVotes ?? ''}
                                        onChange={(e) =>
                                            handleRequiredDecisionVotes(e.target.value)
                                        }
                                        min={1}
                                        max={participantsCount}
                                        disabled={isFinalized}
                                        className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-60'
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className='p-4 bg-blue-50 border-b-blue-50 rounded-xl border border-blue-100'>
                        <p className='text-xs text-blue-700 font-semibold mb-1'>
                            Метод принятия решения
                        </p>
                        <p className='text-xs text-blue-600'>
                            {!config.requiresDecision
                                ? config.requiresCaptain
                                    ? 'Решение принимает капитан'
                                    : 'Итоговое решение не требуется'
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
                        onClick={handleSubmit}
                        disabled={isFinalized}
                        className='flex-1 bg-linear-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-300/150 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed'
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
};
