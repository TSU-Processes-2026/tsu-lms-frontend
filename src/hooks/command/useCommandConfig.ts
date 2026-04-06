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
        distributionMode: 0,
        fixedTeamsCount: 0,
        fixedTeamSize: null,
        minTeamSize: null,
        maxTeamSize: null,
        isFinalized: false,
        finalizedAt: null,
        warnings: [],
    });
    const [segregationType, setType] = useState<'fixed' | 'range' | string>('fixed');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    const navigate = useNavigate();

    const { validateParams } = useValidateCommandConfig();

    const handleDistributionMode = (e: React.ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => {
        setConfig((prev) => ({
            ...prev,
            distributionMode: Number.parseInt(e.target.value),
        }));
        setErrorMessage(null);
    };

    const handleSegregationType = (
        e: React.ChangeEvent<HTMLSelectElement, HTMLSelectElement>,
    ): void => {
        setType(e.target.value);
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

    const handleMinSize = (value: string | null) => {
        if (value) {
            setConfig((prev) => ({
                ...prev,
                minTeamSize: Number.parseInt(value),
            }));
        }
    };

    const handleMaxSize = (value: string | null) => {
        if (value) {
            setConfig((prev) => ({
                ...prev,
                maxTeamSize: Number.parseInt(value),
            }));
        }
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
                fixedTeamSize: segregationType === 'fixed' ? config.fixedTeamSize : null,
                minTeamSize: segregationType === 'range' ? config.minTeamSize : null,
                maxTeamSize: segregationType === 'range' ? config.maxTeamSize : null,
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
        setIsLoading(true);
        const processRequest = async () => {
            try {
                const response: AxiosResponse<TeamConfig> = await fetchConfig(subjectId);
                if (isMounted) {
                    setConfig({
                        subjectId: subjectId,
                        distributionMode: response.data.distributionMode || 0,
                        fixedTeamsCount: Number(response.data.fixedTeamsCount) || 0,
                        fixedTeamSize: Number(response.data.fixedTeamSize) || null,
                        minTeamSize: Number(response.data.minTeamSize) || null,
                        maxTeamSize: Number(response.data.maxTeamSize) || null,
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
                                distributionMode: 0,
                                fixedTeamsCount: 0,
                                fixedTeamSize: null,
                                minTeamSize: null,
                                maxTeamSize: null,
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
                if (isMounted) setIsLoading(false);
            }
        };
        processRequest();
        return () => {
            isMounted = false;
        };
    }, [subjectId]);

    return {
        config,
        errorMessage,
        isLoading,
        isSuccess,
        segregationType,
        handleDistributionMode,
        handleTeamsCount,
        handleSegregationType,
        handleTeamSize,
        handleMinSize,
        handleMaxSize,
        handleSubmit,
    };
};

export const useLoadConfig = (subjectId: string) => {
    const [config, setConfig] = useState<TeamConfig>({
        subjectId: subjectId,
        distributionMode: 0,
        fixedTeamsCount: 0,
        fixedTeamSize: 0,
        minTeamSize: 0,
        maxTeamSize: 0,
        isFinalized: false,
        finalizedAt: null,
        warnings: [],
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isConfigLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        const processRequest = async () => {
            try {
                const response: AxiosResponse<TeamConfig> = await fetchConfig(subjectId);
                if (isMounted) {
                    setConfig({
                        subjectId: subjectId,
                        distributionMode: response.data.distributionMode || 0,
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
                                distributionMode: 0,
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
                if (isMounted) setIsLoading(false);
            }
        };
        processRequest();
        return () => {
            isMounted = false;
        };
    }, [subjectId]);

    return {
        config,
        isConfigLoading,
        errorMessage,
    };
};
