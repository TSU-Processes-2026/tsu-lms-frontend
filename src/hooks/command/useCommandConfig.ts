import { fetchConfig, saveConfigParams } from '@/api/command/command';
import {
    FORBIDDEN_PAGE,
    INTERNAL_SERVER_ERROR_PAGE_URL,
    LOGIN_PAGE_URL,
} from '@/constants/paths/paths';
import { BAD_REQUEST, UNAUTHORIZED_TOKEN, SERVER_ERROR } from '@/constants/response/errorMessages';
import { CommandConfig, TeamConfig } from '@/types/command/CommandConfig';
import { formatToInt } from '@/utils/stringParser';
import { AxiosResponse, isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useValidateCommandConfig } from './useValidateCommandConfig';

export const useCommandConfig = (
    subjectId: string,
    participantsCount: number,
    onClose: () => void,
) => {
    const [config, setConfig] = useState<TeamConfig>({
        subjectId: subjectId,
        distributionMode: 'Manual',
        fixedTeamsCount: 0,
        fixedTeamSize: 0,
        minTeamSize: 0,
        maxTeamSize: 0,
        isFinalized: false,
        finalizedAt: null,
        warnings: [],
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const navigate = useNavigate();
    const getConfig = (): CommandConfig => {
        const form: CommandConfig = {
            distributionMode: config.distributionMode,
            fixedTeamsCount: formatToInt(config.fixedTeamsCount),
            fixedTeamSize: formatToInt(config.fixedTeamSize),
            minTeamSize: formatToInt(config.minTeamSize),
            maxTeamSize: formatToInt(config.maxTeamSize),
        };
        return form;
    };
    const { validateParams } = useValidateCommandConfig(getConfig());

    const handleDistributionMode = (e: React.ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => {
        setConfig((prev) => ({
            ...prev,
            distributionMode: e.target.value,
        }));
        setErrorMessage(null);
    };

    const handleTeamsCount = (value: string) => {
        setConfig((prev) => ({
            ...prev,
            fixedTeamsCount: Number.parseInt(value),
        }));
    };

    const handleTeamSize = (value: string) => {
        setConfig((prev) => ({
            ...prev,
            fixedTeamSize: Number.parseInt(value),
            maxTeamSize: Number.parseInt(value),
        }));
    };

    const handleMinSize = (value: string) => {
        setConfig((prev) => ({
            ...prev,
            minTeamSize: Number.parseInt(value),
        }));
    };

    const handleMaxSize = (value: string) => {
        const parsedValue: number = Number.parseInt(value);
        const validatedMaxSize: number =
            parsedValue > config.fixedTeamSize ? config.fixedTeamSize : parsedValue;
        setConfig((prev) => ({
            ...prev,
            maxTeamSize: validatedMaxSize,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const params: CommandConfig = getConfig();
            const error: string | null = validateParams(participantsCount);
            if (error) {
                return setErrorMessage(error);
            }
            const response: AxiosResponse<TeamConfig> = await saveConfigParams(subjectId, params);
            setConfig((prev) => ({
                ...prev,
                ...response.data,
            }));
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

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        const processRequest = async () => {
            try {
                const response: AxiosResponse<TeamConfig> = await fetchConfig(subjectId);
                if (isMounted) {
                    setConfig((prev) => ({
                        ...prev,
                        ...response.data,
                    }));
                }
            } catch (error) {
                if (isAxiosError(error)) {
                    console.log('Caught an exception: ' + error);
                    switch (error.status) {
                        case 401: {
                            localStorage.clear();
                            navigate(LOGIN_PAGE_URL);
                            break;
                        }
                        case 403: {
                            navigate(FORBIDDEN_PAGE);
                            break;
                        }
                        case 500: {
                            navigate(INTERNAL_SERVER_ERROR_PAGE_URL);
                            break;
                        }
                        default: {
                            setConfig((prev) => ({
                                ...prev,
                                distributionMode: 'Random',
                                fixedTeamsCount: 0,
                                fixedTeamSize: 0,
                                minTeamSize: 0,
                                maxTeamSize: 0,
                                isFinalized: false,
                                finalizedAt: null,
                                warnings: [],
                            }));
                        }
                    }
                } else {
                    setErrorMessage('Не удалось обработать запрос');
                }
            } finally {
                setIsLoading(false);
            }
        };
        processRequest();
        console.log(config);
        return () => {
            isMounted = false;
        };
    }, [subjectId]);

    return {
        config,
        errorMessage,
        isLoading,
        handleDistributionMode,
        handleTeamsCount,
        handleTeamSize,
        handleMinSize,
        handleMaxSize,
        handleSubmit,
    };
};
