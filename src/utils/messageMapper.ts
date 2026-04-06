const warningMap: Record<string, string> = {
    'Total number of students cannot be evenly divided by FixedTeamSize.':
        'Общее число студентов не делится на количество студентов в команде',
    'Total number of students must be equal to FixedTeamsCount multiplied by FixedTeamSize.':
        'Сумма числа студентов, разбитых по командам, должна быть равна общему числу студентов',
    'Total number of students does not fit FixedTeamsCount with MinTeamSize and MaxTeamSize.':
        'Общее количество студентов не соответствует параметрам FixedTeamsCount, MinTeamSize и MaxTeamSize.',
};

const errorMap: Record<string, string> = {
    'Total number of students must be divisible by FixedTeamSize.':
        'Общее количество студентов должно быть делимо на число студентов в команде',
};

export const warningMessageMapper = (warnings: string[]): string[] => {
    return warnings.map((warning) => warningMap[warning] || warning);
};

export const errorMessageMapper = (errors: string[]): string[] => {
    return errors.map((error) => errorMap[error] || error);
};
