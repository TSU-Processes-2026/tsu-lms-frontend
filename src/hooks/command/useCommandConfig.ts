import { saveConfigParams } from '@/api/command/command';
import { LOGIN_PAGE_URL } from '@/constants/paths/paths';
import { BAD_REQUEST, UNAUTHORIZED_TOKEN, SERVER_ERROR } from '@/constants/response/errorMessages';
import { CommandConfig } from '@/types/command/CommandConfig';
import { formatToInt } from '@/utils/stringParser';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useValidateCommandConfig } from './useValidateCommandConfig';

export const useCommandConfig = (
    subjectId: string,
    participantsCount: number,
    onClose: () => void,
) => {
    const currentSubjectId = subjectId;
    const [distributionMode, setMode] = useState<string>('');
    const [fixedTeamsCount, setTeamsCount] = useState<number | string>(0);
    const [fixedTeamSize, setTeamSize] = useState<number | string>(0);
    const [minTeamSize, setMinBound] = useState<number | string>(1);
    const [maxTeamSize, setMaxBound] = useState<number | string>(1);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const navigate = useNavigate();
    const getConfig = (): CommandConfig => {
        const form: CommandConfig = {
            distributionMode: distributionMode,
            fixedTeamsCount: formatToInt(fixedTeamsCount),
            fixedTeamSize: formatToInt(fixedTeamSize),
            minTeamSize: formatToInt(minTeamSize),
            maxTeamSize: formatToInt(maxTeamSize),
        };
        return form;
    };
    const { validateParams } = useValidateCommandConfig(getConfig());

    const handleDistributionMode = (e: React.ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => {
        setMode(e.target.value);
        setErrorMessage(null);
    };

    const handleTeamSize = (value: string) => {
        setTeamSize(value);
        setMaxBound(value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const params: CommandConfig = getConfig();
            const error: string | null = validateParams(participantsCount);
            if (error) {
                return setErrorMessage(error);
            }
            await saveConfigParams(currentSubjectId, params);
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
        setTeamsCount(0);
        setTeamSize(0);
        setErrorMessage(null);
    };

    return {
        distributionMode,
        fixedTeamsCount,
        fixedTeamSize,
        minTeamSize,
        maxTeamSize,
        errorMessage,
        handleDistributionMode,
        setTeamsCount,
        handleTeamSize,
        setMinBound,
        setMaxBound,
        handleSubmit,
    };
};
