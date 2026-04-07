import { INTERNAL_SERVER_ERROR_PAGE_URL, LOGIN_PAGE_URL } from '@/constants/paths/paths';
import { RandomDistributionResponse } from '@/types/command/Team';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoadConfig } from './useCommandConfig';
import { previewRandomTeamDistribution } from '@/api/command/command';
import { errorMessageMapper, warningMessageMapper } from '@/utils/messageMapper';
import { normalizeDistributionMode } from '@/utils/teamConfig';

export function useRandomDistribution(subjectId: string) {
    const [distributedTeams, setTeams] = useState<RandomDistributionResponse>({
        subjectId: subjectId,
        isValid: false,
        teams: [],
        errors: [],
        warnings: [],
        suggestedParameters: null,
    });
    const [distributionError, setDistributionError] = useState<RandomDistributionResponse | null>(
        null,
    );
    const { config } = useLoadConfig(subjectId, 'teacher');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>();
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
    const navigate = useNavigate();
    const handle403ErrorMessage = () => {
        const mode = normalizeDistributionMode(config.distributionMode);
        if (mode === 'Manual') {
            setErrorMessage(
                'Текущий режим разбиения на команды "Ручной". Укажите режим "Случайно"',
            );
        } else if (mode === 'Students') {
            setErrorMessage(
                'Текущий режим разбиения на команды "Самостоятельный". Укажите режим "Случайно"',
            );
        } else if (mode === 'Draft') {
            setErrorMessage('Текущий режим разбиения на команды "Драфт". Укажите режим "Случайно"');
        } else {
            setErrorMessage('У вас не прав на это действие');
        }
    };
    useEffect(() => {
        handleButtonDisableState();
    }, [config]);
    const handleButtonDisableState = () => {
        if (
            normalizeDistributionMode(config.distributionMode) !== 'Random' ||
            distributionError != null ||
            config.warnings.length > 0 ||
            config.isFinalized
        ) {
            setButtonDisabled(true);
        } else {
            setButtonDisabled(false);
        }
    };

    const handleBadDistribution = (response: RandomDistributionResponse): void => {
        if (!response) {
            setErrorMessage('Не удалось обработать запрос. Переданы неверные параметры');
            return;
        }
        if (distributionError) {
            setDistributionError((prev) => ({
                ...prev,
                ...response,
            }));
        } else {
            setDistributionError({ ...response });
        }
    };

    const handleSuggestParameters = (): string | null => {
        if (distributionError && distributionError.suggestedParameters != null) {
            const teamCount =
                'Рекомендованное число команд: ' +
                distributionError.suggestedParameters.suggestedTeamsCount;
            const teamSize = distributionError.suggestedParameters.suggestedFixedTeamSize
                ? '\nРекомендованное число участников в команде: ' +
                  distributionError.suggestedParameters.suggestedFixedTeamSize
                : '';
            const teamMinSize =
                '\nМинимальный размер: ' +
                distributionError.suggestedParameters.suggestedMinTeamSize;
            const teamMaxSize =
                '\nМаксимальный размер: ' +
                distributionError.suggestedParameters.suggestedMaxTeamSize;
            const suggestTeams =
                distributionError.suggestedParameters.suggestedTeamSizes.length > 0
                    ? '\nРекомендованное разбиение по командам: ' +
                      distributionError.suggestedParameters.suggestedTeamSizes
                          .map((size) => size)
                          .join('-')
                    : '';
            return teamCount + teamSize + teamMinSize + teamMaxSize + suggestTeams;
        }
        return null;
    };

    const handleWarningMessages = (): string[] | null => {
        if (distributionError && distributionError.warnings.length > 0) {
            return warningMessageMapper(distributionError.warnings).map((warn) => warn + ';\n');
        }
        return null;
    };

    const handleErrorMessages = (): string[] | null => {
        if (distributionError && distributionError.errors.length > 0) {
            return errorMessageMapper(distributionError.errors).map((error) => error + ';\n');
        }
        return null;
    };

    const handleDistributeTeamsByRandomMode = async () => {
        if (config.isFinalized) {
            setErrorMessage('Команды финализированы. Повторное распределение запрещено');
            return;
        }
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
                        handleBadDistribution(error.response?.data || null);
                        break;
                    }
                    case 401: {
                        navigate(LOGIN_PAGE_URL);
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

    useEffect(() => {
        let isMounted = true;
        if (isMounted) handleDistributeTeamsByRandomMode();
        return () => {
            isMounted = false;
        };
    }, []);

    return {
        distributedTeams,
        distributionError,
        isLoading,
        errorMessage,
        buttonDisabled,
        handleDistributeTeamsByRandomMode,
        handleWarningMessages,
        handleErrorMessages,
        handleSuggestParameters,
    };
}
