import { INTERNAL_SERVER_ERROR_PAGE_URL, LOGIN_PAGE_URL } from '@/constants/paths/paths';
import { RandomDistributionResponse } from '@/types/command/Team';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoadConfig } from './useCommandConfig';
import { previewRandomTeamDistribution } from '@/api/command/command';

export function useRandomDistribution(subjectId: string) {
    const [distributedTeams, setTeams] = useState<RandomDistributionResponse>({
        subjectId: subjectId,
        isValid: false,
        teams: [],
        errors: [],
        warnings: [],
        suggestedParameters: null,
    });
    const { config } = useLoadConfig(subjectId);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>();
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
    const navigate = useNavigate();
    const handle403ErrorMessage = () => {
        if (config.distributionMode == 0) {
            setErrorMessage(
                'Текущий режим разбиения на команды "Ручной". Укажите режим "Случайно"',
            );
        } else if (config.distributionMode == 2) {
            setErrorMessage(
                'Текущий режим разбиения на команды "Самостоятельный". Укажите режим "Случайно"',
            );
        } else if (config.distributionMode == 3) {
            setErrorMessage(
                'Текущий режим разбиения на команды "Шаблон". Укажите режим "Случайно"',
            );
        } else {
            setErrorMessage('У вас не прав на это действие');
        }
    };
    useEffect(() => {
        handleButtonDisableState();
    }, [config]);
    const handleButtonDisableState = () => {
        if (config.distributionMode !== 1) {
            setButtonDisabled(true);
        } else {
            setButtonDisabled(false);
        }
    };
    const handleDistributeTeamsByRandomMode = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const response: RandomDistributionResponse = await previewRandomTeamDistribution(
                config.subjectId,
            );
            setTeams({
                subjectId: response.subjectId,
                isValid: response.isValid,
                teams: response.teams,
                errors: response.errors,
                warnings: response.warnings,
                suggestedParameters: response.suggestedParameters,
            });
        } catch (error) {
            if (isAxiosError(error)) {
                switch (error.status) {
                    case 400: {
                        setErrorMessage(
                            error.response?.data.detail || 'Переданы неверные параметры',
                        );
                        break;
                    }
                    case 401: {
                        throw error;
                        break;
                    }
                    case 403: {
                        handle403ErrorMessage();
                        break;
                    }
                    case 404: {
                        navigate('*');
                        break;
                    }
                    default: {
                        navigate(INTERNAL_SERVER_ERROR_PAGE_URL);
                        break;
                    }
                }
            } else {
                setErrorMessage('Не удалось обработать запрос');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        distributedTeams,
        isLoading,
        errorMessage,
        buttonDisabled,
        handleDistributeTeamsByRandomMode,
    };
}
