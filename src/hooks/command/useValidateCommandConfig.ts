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
        if (mode === 'Draft' && !form.requiresCaptain) {
            return 'В режиме драфта капитан обязателен';
        }

        if (!form.requiresDecision) {
            return null;
        }

        if (!form.requiresCaptain && form.decisionMode !== 'Voting') {
            return 'Без капитана метод принятия решения должен быть "Голосование"';
        }

        if (form.requiresCaptain && form.decisionMode !== 'CaptainDecides') {
            return 'При включенном капитане метод принятия решения должен быть "Выбор капитана"';
        }

        return null;
    };

    const validateDeadlines = (form: TeamConfig): string | null => {
        if (
            form.requiresCaptain &&
            form.captainSelectionMode === 'Voting' &&
            form.captainVotingDeadlineDays != null &&
            form.captainVotingDeadlineDays < 1
        ) {
            return 'Укажите корректный срок голосования за капитана';
        }

        if (form.requiresDecision && form.decisionDeadlineDays != null && form.decisionDeadlineDays < 1) {
            return 'Укажите корректный срок итогового решения';
        }

        if (
            form.requiresCaptain &&
            form.requiresDecision &&
            form.captainVotingDeadlineDays != null &&
            form.decisionDeadlineDays != null &&
            form.captainVotingDeadlineDays > form.decisionDeadlineDays
        ) {
            return 'Срок выбора капитана должен быть раньше срока итогового решения';
        }

        return null;
    };

    const validateDecisionRequirement = (
        totalStudentsCount: number,
        form: TeamConfig,
    ): string | null => {
        if (form.requiresDecision && !form.decisionMode) {
            return 'Укажите способ принятия итогового решения';
        }

        if (!form.requiresDecision) {
            return null;
        }

        if (form.decisionDeadlineDays == null) {
            return 'Укажите срок принятия итогового решения';
        }

        if (form.requiredDecisionVotes == null) {
            return 'Укажите количество решений внутри команды';
        }

        if (form.requiredDecisionVotes < 1 || form.requiredDecisionVotes > totalStudentsCount) {
            return 'Количество решений должно быть в пределах от 1 до числа студентов';
        }

        if (form.requiresCaptain && form.requiredDecisionVotes !== 1) {
            return 'При режиме с капитаном количество решений должно быть равно 1';
        }

        if (
            form.requiresCaptain &&
            form.captainSelectionMode === 'Voting' &&
            form.captainVotingDeadlineDays == null
        ) {
            return 'Укажите срок голосования за капитана';
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

        validationResult = validateCaptainAndDecisionRules(form);
        if (validationResult) return validationResult;

        validationResult = validateDecisionRequirement(totalStudentsCount, form);
        if (validationResult) return validationResult;

        validationResult = validateDeadlines(form);
        return validationResult;
    };

    return {
        validateParams,
    };
};
