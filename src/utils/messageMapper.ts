const warningMap: Record<string, string> = {
    'Total number of students cannot be evenly divided by FixedTeamSize.':
        'Общее число студентов не делится на количество студентов в команде',
    'Total number of students must be equal to FixedTeamsCount multiplied by FixedTeamSize.':
        'Сумма числа студентов, разбитых по командам, должна быть равна общему числу студентов',
    'Total number of students does not fit FixedTeamsCount with MinTeamSize and MaxTeamSize.':
        'Общее количество студентов не соответствует параметрам FixedTeamsCount, MinTeamSize и MaxTeamSize.',
    'Teams count does not match FixedTeamsCount.':
        'Количество команд не совпадает с FixedTeamsCount.',
    'All teams must have exactly FixedTeamSize members.':
        'Все команды должны иметь равное число участников',
    'All teams must be within MinTeamSize and MaxTeamSize.':
        'Все команды должны соответствовать минимальному и максимальному размеру команды.',
    'FixedTeamsCount exceeds total number of students.':
        'Число превышает общее количество студентов.',
    'Current number of students cannot be distributed within MinTeamSize and MaxTeamSize.':
        'Текущее количество студентов не может быть распределено между минимальным и максимальным размером участников команды.',
    'All students must be assigned to a team.':
        'Все сутденты должны быть распределены по командам.',
};

const errorMap: Record<string, string> = {
    'Total number of students cannot be evenly divided by FixedTeamSize.':
        'Общее число студентов не делится на количество студентов в команде',
    'Total number of students must be equal to FixedTeamsCount multiplied by FixedTeamSize.':
        'Сумма числа студентов, разбитых по командам, должна быть равна общему числу студентов',
    'Total number of students does not fit FixedTeamsCount with MinTeamSize and MaxTeamSize.':
        'Общее количество студентов не соответствует параметрам FixedTeamsCount, MinTeamSize и MaxTeamSize.',
    'Teams count does not match FixedTeamsCount.':
        'Количество команд не совпадает с FixedTeamsCount.',
    'All teams must have exactly FixedTeamSize members.':
        'Все команды должны иметь равное число участников',
    'All teams must be within MinTeamSize and MaxTeamSize.':
        'Все команды должны соответствовать минимальному и максимальному размеру команды.',
    'FixedTeamsCount exceeds total number of students.':
        'Число превышает общее количество студентов.',
    'Current number of students cannot be distributed within MinTeamSize and MaxTeamSize.':
        'Текущее количество студентов не может быть распределено между минимальным и максимальным размером участников команды.',
    'All students must be assigned to a team.':
        'Все сутденты должны быть распределены по командам.',
    'Total number of students must be divisible by FixedTeamSize.':
        'Общее количество студентов должно быть делимо на число студентов в команде',
    'Each student must belong to only one team.':
        'Каждый студент может состоять только в одной команде',
    'All team members must be students of the subject.':
        'Все члены команды должны быть участниками предмета',
    'FixedTeamsCount must be greater than zero.': 'Число команд должно быть больше нуля.',
    'FixedTeamSize must be greater than zero.':
        'Число участников в командах должно быть больше нуля',
    'MinTeamSize must be greater than zero.': 'Минимальный размер команды должен быть больше нуля',
    'MaxTeamSize must be greater than zero.': 'Максимальный размер команды должен быть больше нуля',
    'MinTeamSize must be less than or equal to MaxTeamSize.':
        'Минимальный размер команды должен быть не больше максимального',
    'A draft is already in progress.': 'Черновик команд уже создан',
};

export const warningMessageMapper = (warnings: string[]): string[] => {
    return warnings.map((warning) => warningMap[warning] || warning);
};

export const errorMessageMapper = (errors: string[]): string[] => {
    return errors.map((error) => errorMap[error] || error);
};

export const mapErrorMessage = (msg: string | null): string | null => {
    if (msg) {
        return errorMap[msg] || msg;
    }
    return null;
};
