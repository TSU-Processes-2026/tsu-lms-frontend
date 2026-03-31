import { CommandConfig } from '@/types/command/CommandConfig';
import { useState } from 'react';

export const useValidateCommandConfig = (params: CommandConfig) => {
    const form = params;

    const isCommanderEnabled = (): boolean => {
        return form?.enableCommander && form.enableCommander == true;
    };

    const isDraftSelected = (): boolean => {
        return form.mode === 'draft';
    };

    const isCommandCountValid = (totalStudentsCount: number): boolean => {
        if (form.commandCount <= 0) return false;
        return form.commandCount <= totalStudentsCount;
    };

    const isStudentCountValid = (totalStudents: number): boolean => {
        if (form.studentsCount <= 0) return false;
        if (form.studentsCount > totalStudents) return false;
        let val = totalStudents % form.studentsCount;
        return val === 0;
    };

    const isMinBoundValid = () => {
        if (form.minBound <= 0) return false;
        return true;
    };

    const isMaxBoundValid = () => {
        if (form.maxBound <= 0) return false;
        if (form.minBound > form.maxBound) return false;
        return true;
    };

    const validateParams = (totalStudentsCount: number): string | null => {
        if (isDraftSelected()) {
            if (!isCommanderEnabled()) return 'Для режима Draft назначение капитана обязательно';
        }
        if (form.segregationType === 'commands' && !isCommandCountValid(totalStudentsCount)) {
            if (form.commandCount <= 0) {
                return 'Количество команд должно быть больше 0';
            }
            return 'Количество команд не может превышать общее число студентов';
        }
        if (form.segregationType === 'students_count' && !isStudentCountValid(totalStudentsCount)) {
            if (form.studentsCount <= 0) return 'Количество участников должно быть больше 0';
            if (form.studentsCount > totalStudentsCount)
                return 'Количество участников должно быть меньше общего числа студентов';

            return 'Число участников в командах должно быть равным. Укажите другое количество или выберите другой способ разбиения.';
        }
        if (form.segregationType === 'students_range') {
            if (!isMinBoundValid()) return 'Указана неверная минимальная граница диапазона';
            if (!isMaxBoundValid()) return 'Указана неверная максимальная граница диапазона';
        }

        return null;
    };

    return {
        validateParams,
    };
};
