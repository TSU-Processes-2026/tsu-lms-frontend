import { TeamConfig } from '@/types/command/CommandConfig';

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
        }
        return null;
    };

    const validateTeamBounds = (totalStudentsCount: number, form: TeamConfig): string | null => {
        if (!isMinBoundValid(totalStudentsCount, form))
            return 'Указана неверная минимальная граница диапазона';
        if (!isMaxBoundValid(totalStudentsCount, form))
            return 'Указана неверная максимальная граница диапазона';

        if (form.maxTeamSize && form.fixedTeamSize) {
            if (form.maxTeamSize > form.fixedTeamSize)
                return 'Верхняя граница не должна превышать число участников в команде';
        }
        return null;
    };

    const validateTeamsCount = (totalStudentsCount: number, form: TeamConfig): string | null => {
        if (form.fixedTeamsCount <= 0) return 'Количество команд должно быть больше 0';

        if (form.fixedTeamsCount > totalStudentsCount)
            return 'Количество команд не может превышать общее число студентов';

        return null;
    };

    const validateParams = (totalStudentsCount: number, form: TeamConfig): string | null => {
        let validationResult = null;
        validationResult = validateTeamsCount(totalStudentsCount, form);
        if (validationResult) return validationResult;

        validationResult = validateTeamSize(totalStudentsCount, form);
        if (validationResult) return validationResult;

        validationResult = validateTeamBounds(totalStudentsCount, form);
        return validationResult;
    };

    return {
        validateParams,
    };
};
