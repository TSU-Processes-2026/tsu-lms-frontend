import { TeamConfig } from '@/types/command/CommandConfig';
import { normalizeDistributionMode } from '@/utils/teamConfig';

export const useValidateCommandConfig = () => {
    const isMinBoundValid = (totalStudentsCount: number, form: TeamConfig) => {
        if (form.minTeamSize && form.maxTeamSize) {
            if (
                form.minTeamSize <= 0 ||
                form.minTeamSize > totalStudentsCount ||
                form.minTeamSize > form.maxTeamSize
            )
                return false;
        }
        return true;
    };

    const isMaxBoundValid = (totalStudentsCount: number, form: TeamConfig) => {
        if (form.maxTeamSize) {
            if (form.maxTeamSize <= 0 || form.maxTeamSize > totalStudentsCount) return false;
        }
        return true;
    };

    const validateTeamSize = (totalStudentsCount: number, form: TeamConfig): string | null => {
        if (form.fixedTeamSize) {
            if (form.fixedTeamSize <= 0) return 'Количество участников должно быть больше 0';
            if (form.fixedTeamSize > totalStudentsCount)
                return 'Количество участников должно быть меньше общего числа студентов';
            if (totalStudentsCount % form.fixedTeamSize !== 0) {
                return `При фиксированном размере команды (${form.fixedTeamSize}) количество студентов (${totalStudentsCount}) должно делиться без остатка`;
            }
        }
        return null;
    };

    const validateTeamBounds = (totalStudentsCount: number, form: TeamConfig): string | null => {
        if (!isMinBoundValid(totalStudentsCount, form))
            return 'Указана неверная минимальная граница диапазона';
        if (!isMaxBoundValid(totalStudentsCount, form))
            return 'Указана неверная максимальная граница диапазона';
        if (form.minTeamSize && form.maxTeamSize && form.fixedTeamsCount > 0) {
            const minStudents = form.minTeamSize * form.fixedTeamsCount;
            const maxStudents = form.maxTeamSize * form.fixedTeamsCount;
            if (totalStudentsCount < minStudents || totalStudentsCount > maxStudents) {
                return 'Текущее число студентов не укладывается в выбранный диапазон размеров команд';
            }
        }

        return null;
    };

    const validateTeamsCount = (totalStudentsCount: number, form: TeamConfig): string | null => {
        if (form.fixedTeamsCount <= 0) return 'Количество команд должно быть больше 0';

        if (form.fixedTeamsCount > totalStudentsCount)
            return 'Количество команд не может превышать общее число студентов';

        return null;
    };

    const validateCaptainAndDecisionRules = (form: TeamConfig): string | null => {
        const mode = normalizeDistributionMode(form.distributionMode);
        if (mode === 'Draft' && !form.captainEnabled) {
            return 'В режиме драфта капитан обязателен';
        }

        if (!form.captainEnabled && form.decisionMethod !== 'Voting') {
            return 'Без капитана метод принятия решения должен быть "Голосование"';
        }

        if (form.captainEnabled && form.decisionMethod !== 'CaptainChoice') {
            return 'При включенном капитане метод принятия решения должен быть "Выбор капитана"';
        }

        return null;
    };

    const validateFinalDecisionThreshold = (
        totalStudentsCount: number,
        form: TeamConfig,
    ): string | null => {
        if (form.finalDecisionThreshold == null) {
            return 'Укажите порог принятия финального решения';
        }
        if (form.finalDecisionThreshold < 1 || form.finalDecisionThreshold > totalStudentsCount) {
            return `Порог принятия решения должен быть в диапазоне от 1 до ${totalStudentsCount}`;
        }
        return null;
    };

    const validateParams = (totalStudentsCount: number, form: TeamConfig): string | null => {
        let validationResult = null;
        validationResult = validateTeamsCount(totalStudentsCount, form);
        if (validationResult) return validationResult;

        validationResult = validateTeamSize(totalStudentsCount, form);
        if (validationResult) return validationResult;

        validationResult = validateTeamBounds(totalStudentsCount, form);
        if (validationResult) return validationResult;

        validationResult = validateFinalDecisionThreshold(totalStudentsCount, form);
        if (validationResult) return validationResult;

        validationResult = validateCaptainAndDecisionRules(form);
        return validationResult;
    };

    return {
        validateParams,
    };
};
