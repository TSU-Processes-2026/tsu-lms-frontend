import { fetchConfig, saveConfigParams } from '@/api/command/command';
import {
    FORBIDDEN_PAGE,
    INTERNAL_SERVER_ERROR_PAGE_URL,
    LOGIN_PAGE_URL,
} from '@/constants/paths/paths';
import { BAD_REQUEST, UNAUTHORIZED_TOKEN, SERVER_ERROR } from '@/constants/response/errorMessages';
import { TeamConfig } from '@/types/command/CommandConfig';

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
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    const navigate = useNavigate();

    const { validateParams } = useValidateCommandConfig();

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
            const error: string | null = validateParams(participantsCount, config);
            if (error) {
                return setErrorMessage(error);
            }
            const response: AxiosResponse<TeamConfig> = await saveConfigParams(subjectId, {
                distributionMode: config.distributionMode,
                fixedTeamsCount: config.fixedTeamsCount,
                fixedTeamSize: config.fixedTeamSize,
                minTeamSize: config.minTeamSize,
                maxTeamSize: config.maxTeamSize,
            });
            setConfig((prev) => ({
                ...prev,
                ...response.data,
            }));
            setIsSuccess(true);
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
        const processRequest = async () => {
            try {
                const response: AxiosResponse<TeamConfig> = await fetchConfig(subjectId);
                if (isMounted) {
                    console.log('Config: ', response.data);
                    setConfig({
                        subjectId: subjectId,
                        distributionMode: response.data.distributionMode ?? 'Manual',
                        fixedTeamsCount: Number(response.data.fixedTeamsCount) || 0,
                        fixedTeamSize: Number(response.data.fixedTeamSize) || 0,
                        minTeamSize: Number(response.data.minTeamSize) || 1,
                        maxTeamSize: Number(response.data.maxTeamSize) || 1,
                        warnings: response.data.warnings ?? [],
                        isFinalized: Boolean(response.data.isFinalized) || false,
                        finalizedAt: response.data.finalizedAt ?? null,
                    });
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
                                distributionMode: 'Manual',
                                fixedTeamsCount: 0,
                                fixedTeamSize: 0,
                                minTeamSize: 1,
                                maxTeamSize: 1,
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

        return () => {
            isMounted = false;
        };
    }, [subjectId]);

    useEffect(() => {
        console.log('New config: ', config);
    }, [config]);

    return {
        config,
        errorMessage,
        isLoading,
        isSuccess,
        handleDistributionMode,
        handleTeamsCount,
        handleTeamSize,
        handleMinSize,
        handleMaxSize,
        handleSubmit,
    };
};
