import { saveConfigParams } from '@/api/command/command';
import { LOGIN_PAGE_URL } from '@/constants/paths/paths';
import { BAD_REQUEST, UNAUTHORIZED_TOKEN, SERVER_ERROR } from '@/constants/response/errorMessages';
import { CommandConfig } from '@/types/command/CommandConfig';
import { formatToInt } from '@/utils/stringParser';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useValidateCommandConfig } from './useValidateCommandConfig';

export const useCommandConfig = (onClose: () => void) => {
    const [selectedMode, setMode] = useState<string>('');
    const [commandsCount, setCommandsCount] = useState<number | string>(0);
    const [studentsInCommand, setStudentsNumber] = useState<number | string>(0);
    const [minBound, setMinBound] = useState<number | string>(0);
    const [maxBound, setMaxBound] = useState<number | string>(0);
    const [enableCommander, setEnableCommander] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [segregationType, setType] = useState<'commands' | 'students_count' | 'students_range'>(
        'commands',
    );
    const navigate = useNavigate();
    const getForm = (): CommandConfig => {
        const form: CommandConfig = {
            mode: selectedMode,
            commandCount: formatToInt(commandsCount),
            studentsCount: formatToInt(studentsInCommand),
            minBound: formatToInt(minBound),
            maxBound: formatToInt(maxBound),
            segregationType: segregationType,
            enableCommander: enableCommander,
        };
        return form;
    };
    const { validateParams } = useValidateCommandConfig(getForm());

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const params: CommandConfig = getForm();
            const error: string | null = validateParams(24);
            if (error) {
                return setErrorMessage(error);
            }
            await saveConfigParams(params);
            resetConfigParams();
            onClose();
        } catch (error) {
            if (isAxiosError(error)) {
                if (error.response?.status === 400) {
                    setErrorMessage(error.response.data.detail || BAD_REQUEST);
                } else if (error.response?.status === 401) {
                    setErrorMessage(error.response.data.detail || UNAUTHORIZED_TOKEN);
                    localStorage.clear();
                    navigate(LOGIN_PAGE_URL);
                } else {
                    setErrorMessage(error.response?.data.detail || SERVER_ERROR);
                }
            } else {
                setErrorMessage('Не удалось обработать запрос');
            }
        }
    };

    const resetConfigParams = (): void => {
        setMode('');
        setCommandsCount(0);
        setStudentsNumber(0);
        setErrorMessage(null);
    };

    return {
        selectedMode,
        commandsCount,
        studentsInCommand,
        minBound,
        maxBound,
        enableCommander,
        segregationType,
        errorMessage,
        setMode,
        setCommandsCount,
        setStudentsNumber,
        setMinBound,
        setMaxBound,
        setType,
        setEnableCommander,
        handleSubmit,
    };
};
