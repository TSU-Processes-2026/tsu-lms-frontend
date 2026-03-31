import { saveConfigParams } from '@/api/command/command';
import { LOGIN_PAGE_URL } from '@/constants/paths/paths';
import { BAD_REQUEST, UNAUTHORIZED_TOKEN, SERVER_ERROR } from '@/constants/response/errorMessages';
import { CommandConfig } from '@/types/command/CommandConfig';
import { formatToInt } from '@/utils/stringParser';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useCommandConfig = (onClose: () => void) => {
    const [selectedMode, setMode] = useState<string>('');
    const [commandsCount, setCommandsCount] = useState<number | string>(0);
    const [studentsInCommand, setStudentsNumber] = useState<number | string>(0);
    const [enableCommander, setEnableCommander] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const params: CommandConfig = createForm();
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

    const createForm = (): CommandConfig => {
        const form: CommandConfig = {
            mode: selectedMode,
            commandCount: formatToInt(commandsCount),
            studentsCount: formatToInt(studentsInCommand),
            enableCommander: enableCommander,
        };
        return form;
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
        enableCommander,
        errorMessage,
        setMode,
        setCommandsCount,
        setStudentsNumber,
        setEnableCommander,
        handleSubmit,
    };
};
