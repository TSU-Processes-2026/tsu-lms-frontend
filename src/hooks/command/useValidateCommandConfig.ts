import { CommandConfig, TeamConfig } from '@/types/command/CommandConfig';

export const useValidateCommandConfig = () => {
    const isMinBoundValid = (totalStudentsCount: number, form: TeamConfig) => {
        if (
            form.minTeamSize <= 0 ||
            form.minTeamSize > totalStudentsCount ||
            form.minTeamSize > form.maxTeamSize
        )
            return false;
        return true;
    };

    const isMaxBoundValid = (totalStudentsCount: number, form: TeamConfig) => {
        if (form.maxTeamSize <= 0 || form.maxTeamSize > totalStudentsCount) return false;
        return true;
    };

    const validateTeamSize = (totalStudentsCount: number, form: TeamConfig): string | null => {
        if (form.fixedTeamSize <= 0) return 'Количество участников должно быть больше 0';
        if (form.fixedTeamSize > totalStudentsCount)
            return 'Количество участников должно быть меньше общего числа студентов';
        let teamsSize = totalStudentsCount / form.fixedTeamsCount;
        if (form.fixedTeamSize > teamsSize)
            return `Указано неверное число участников команды: 
        Число команд: ${form.fixedTeamsCount}
        Максимально допустимое число участников: ${teamsSize}`;

        let val = totalStudentsCount % form.fixedTeamSize;
        if (val != 0)
            return 'Число участников в командах должно быть равным. Укажите другое количество или выберите другой способ разбиения.';
        let teamsCount = totalStudentsCount / form.fixedTeamSize;
        if (teamsCount != form.fixedTeamsCount)
            return `Число команд при разбиении не совпадает с указанным. Указано: ${form.fixedTeamsCount}
            Число команд при указанном количестве участников: ${teamsCount}
        `;
        return null;
    };

    const validateTeamBounds = (totalStudentsCount: number, form: TeamConfig): string | null => {
        if (!isMinBoundValid(totalStudentsCount, form))
            return 'Указана неверная минимальная граница диапазона';
        if (!isMaxBoundValid(totalStudentsCount, form))
            return 'Указана неверная максимальная граница диапазона';

        if (form.maxTeamSize > form.fixedTeamSize)
            return 'Верхняя граница не должна превышать число участников в команде';
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
