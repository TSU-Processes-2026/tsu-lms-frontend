import { fetchConfig, saveConfigParams } from '@/api/command/command';
import {
    FORBIDDEN_PAGE,
    INTERNAL_SERVER_ERROR_PAGE_URL,
    LOGIN_PAGE_URL,
} from '@/constants/paths/paths';
import {
    FinalDecisionMethod,
    TeamConfig,
    TeamDistributionMode,
} from '@/types/command/CommandConfig';

import { AxiosResponse, isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useValidateCommandConfig } from './useValidateCommandConfig';
import { normalizeDistributionMode } from '@/utils/teamConfig';

const createDefaultConfig = (subjectId: string): TeamConfig => ({
    subjectId,
    distributionMode: 'Manual',
    fixedTeamsCount: 0,
    fixedTeamSize: null,
    minTeamSize: null,
    maxTeamSize: null,
    captainEnabled: false,
    captainSelectionMethod: 'Manual',
    captainVotingDeadline: null,
    finalDecisionThreshold: 1,
    decisionMethod: 'Voting',
    finalDecisionDeadline: null,
    isFinalized: false,
    finalizedAt: null,
    warnings: [],
});

const normalizeDecisionMethod = (captainEnabled: boolean): FinalDecisionMethod =>
    captainEnabled ? 'CaptainDecision' : 'Voting';

const normalizeLoadedDecisionMethod = (
    decisionMethod: FinalDecisionMethod | null | undefined,
    captainEnabled: boolean,
): FinalDecisionMethod => {
    if (!captainEnabled) {
        return 'Voting';
    }

    if (decisionMethod === 'CaptainChoice' || decisionMethod === 'CaptainDecision') {
        return decisionMethod;
    }

    return 'CaptainDecision';
};

export const useCommandConfig = (
    subjectId: string,
    participantsCount: number,
    role: 'student' | 'teacher' | 'admin' | string,
) => {
    const [config, setConfig] = useState<TeamConfig>(createDefaultConfig(subjectId));
    const [segregationType, setType] = useState<'fixed' | 'range'>('fixed');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    const navigate = useNavigate();

    const { validateParams } = useValidateCommandConfig();

    const handleDistributionMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextMode = normalizeDistributionMode(e.target.value);
        setConfig((prev) => {
            const captainEnabled = nextMode === 'Draft' ? true : prev.captainEnabled;
            return {
                ...prev,
                distributionMode: nextMode,
                captainEnabled,
                captainSelectionMethod:
                    nextMode === 'Random' || nextMode === 'Manual' ? 'Voting' : 'Manual',
                decisionMethod: normalizeDecisionMethod(captainEnabled),
            };
        });
        setErrorMessage(null);
        setIsSuccess(false);
    };

    const handleSegregationType = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        setType(e.target.value === 'range' ? 'range' : 'fixed');
        setErrorMessage(null);
        setIsSuccess(false);
    };

    const parsePositiveNumber = (value: string): number | null => {
        const parsed = Number.parseInt(value, 10);
        return Number.isFinite(parsed) ? parsed : null;
    };

    const handleTeamsCount = (value: string) => {
        setConfig((prev) => ({
            ...prev,
            fixedTeamsCount: parsePositiveNumber(value) ?? 0,
        }));
        setIsSuccess(false);
    };

    const handleTeamSize = (value: string) => {
        const parsed = parsePositiveNumber(value);
        setConfig((prev) => ({
            ...prev,
            fixedTeamSize: parsed,
            maxTeamSize: parsed,
            minTeamSize: parsed,
        }));
        setIsSuccess(false);
    };

    const handleMinSize = (value: string | null) => {
        setConfig((prev) => ({
            ...prev,
            minTeamSize: value ? parsePositiveNumber(value) : null,
        }));
        setIsSuccess(false);
    };

    const handleMaxSize = (value: string | null) => {
        setConfig((prev) => ({
            ...prev,
            maxTeamSize: value ? parsePositiveNumber(value) : null,
        }));
        setIsSuccess(false);
    };

    const handleCaptainEnabled = (enabled: boolean) => {
        setConfig((prev) => {
            const mode = normalizeDistributionMode(prev.distributionMode);
            const captainEnabled = mode === 'Draft' ? true : enabled;
            return {
                ...prev,
                captainEnabled,
                captainSelectionMethod:
                    captainEnabled && (mode === 'Random' || mode === 'Manual') ? 'Voting' : 'Manual',
                decisionMethod: normalizeDecisionMethod(captainEnabled),
                captainVotingDeadline: captainEnabled ? prev.captainVotingDeadline : null,
            };
        });
        setIsSuccess(false);
    };

    const handleFinalDecisionThreshold = (value: string) => {
        setConfig((prev) => ({
            ...prev,
            finalDecisionThreshold: parsePositiveNumber(value),
        }));
        setIsSuccess(false);
    };

    const handleCaptainVotingDeadline = (value: string) => {
        setConfig((prev) => ({
            ...prev,
            captainVotingDeadline: value || null,
        }));
        setIsSuccess(false);
    };

    const handleFinalDecisionDeadline = (value: string) => {
        setConfig((prev) => ({
            ...prev,
            finalDecisionDeadline: value || null,
        }));
        setIsSuccess(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const preparedConfig: TeamConfig = {
                ...config,
                decisionMethod: normalizeDecisionMethod(config.captainEnabled),
            };

            const error: string | null = validateParams(participantsCount, preparedConfig);
            if (error) {
                setIsSuccess(false);
                return setErrorMessage(error);
            }

            const response: AxiosResponse<TeamConfig> = await saveConfigParams(subjectId, {
                distributionMode: normalizeDistributionMode(preparedConfig.distributionMode),
                fixedTeamsCount: preparedConfig.fixedTeamsCount,
                fixedTeamSize: segregationType === 'fixed' ? preparedConfig.fixedTeamSize : null,
                minTeamSize: segregationType === 'range' ? preparedConfig.minTeamSize : null,
                maxTeamSize: segregationType === 'range' ? preparedConfig.maxTeamSize : null,
                captainEnabled: preparedConfig.captainEnabled,
                captainSelectionMethod:
                    preparedConfig.captainEnabled &&
                    (preparedConfig.distributionMode === 'Random' ||
                        preparedConfig.distributionMode === 'Manual')
                        ? 'Voting'
                        : 'Manual',
                captainVotingDeadline: preparedConfig.captainVotingDeadline,
                finalDecisionThreshold: preparedConfig.finalDecisionThreshold,
                decisionMethod: normalizeDecisionMethod(preparedConfig.captainEnabled),
                finalDecisionDeadline: preparedConfig.finalDecisionDeadline,
            });
            const loadedMode = normalizeDistributionMode(response.data.distributionMode);
            setConfig({
                ...createDefaultConfig(subjectId),
                ...response.data,
                distributionMode: loadedMode,
                captainEnabled: Boolean(response.data.captainEnabled),
                captainSelectionMethod:
                    response.data.captainSelectionMethod &&
                    response.data.captainSelectionMethod === 'Voting'
                        ? 'Voting'
                        : loadedMode === 'Random' || loadedMode === 'Manual'
                          ? 'Voting'
                          : 'Manual',
                captainVotingDeadline: response.data.captainVotingDeadline ?? null,
                finalDecisionThreshold:
                    Number(response.data.finalDecisionThreshold) || participantsCount || 1,
                decisionMethod: normalizeLoadedDecisionMethod(
                    response.data.decisionMethod,
                    Boolean(response.data.captainEnabled),
                ),
                finalDecisionDeadline: response.data.finalDecisionDeadline ?? null,
            });
            setErrorMessage(null);
            setIsSuccess(true);
            onClose();
        } catch (error) {
            if (isAxiosError(error)) {
                if (error.response?.status === 400) {
                    setErrorMessage(error.response.data.detail || 'Переданы неверные параметры');
                } else if (error.response?.status === 401) {
                    setErrorMessage(error.response.data.detail || 'Требуется повторная авторизация');
                    localStorage.clear();
                    navigate(LOGIN_PAGE_URL);
                } else {
                    setErrorMessage(error.response?.data.detail || 'Ошибка сервера');
                }
            } else {
                setErrorMessage('Не удалось обработать запрос');
            }
        }
    };

    useEffect(() => {
        if (role === 'student') return;
        let isMounted = true;
        setIsLoading(true);
        const processRequest = async () => {
            try {
                const response: AxiosResponse<TeamConfig> = await fetchConfig(subjectId);
                if (isMounted) {
                    const loadedMode = normalizeDistributionMode(response.data.distributionMode);
                    const fixedTeamSize = Number(response.data.fixedTeamSize) || null;
                    const minTeamSize = Number(response.data.minTeamSize) || null;
                    const maxTeamSize = Number(response.data.maxTeamSize) || null;
                    const captainEnabled =
                        loadedMode === 'Draft' ? true : Boolean(response.data.captainEnabled);
                    setType(fixedTeamSize ? 'fixed' : 'range');
                    setConfig({
                        ...createDefaultConfig(subjectId),
                        ...response.data,
                        subjectId,
                        distributionMode: loadedMode,
                        fixedTeamsCount: Number(response.data.fixedTeamsCount) || 0,
                        fixedTeamSize,
                        minTeamSize,
                        maxTeamSize,
                        captainEnabled,
                        captainSelectionMethod:
                            captainEnabled && (loadedMode === 'Random' || loadedMode === 'Manual')
                                ? 'Voting'
                                : 'Manual',
                        captainVotingDeadline: response.data.captainVotingDeadline ?? null,
                        finalDecisionThreshold:
                            Number(response.data.finalDecisionThreshold) || participantsCount || 1,
                        decisionMethod: normalizeLoadedDecisionMethod(
                            response.data.decisionMethod,
                            captainEnabled,
                        ),
                        finalDecisionDeadline: response.data.finalDecisionDeadline ?? null,
                    });
                }
            } catch (error) {
                if (isAxiosError(error)) {
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
                            setConfig(createDefaultConfig(subjectId));
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
    }, [subjectId, role, navigate, participantsCount]);

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
        handleCaptainEnabled,
        handleFinalDecisionThreshold,
        handleCaptainVotingDeadline,
        handleFinalDecisionDeadline,
        handleSubmit,
    };
};

export const useLoadConfig = (subjectId: string, role: string) => {
    const [config, setConfig] = useState<TeamConfig>(createDefaultConfig(subjectId));
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
                    const loadedMode: TeamDistributionMode = normalizeDistributionMode(
                        response.data.distributionMode,
                    );
                    const captainEnabled =
                        loadedMode === 'Draft' ? true : Boolean(response.data.captainEnabled);
                    setConfig({
                        ...createDefaultConfig(subjectId),
                        ...response.data,
                        subjectId,
                        distributionMode: loadedMode,
                        fixedTeamsCount: Number(response.data.fixedTeamsCount) || 0,
                        fixedTeamSize: Number(response.data.fixedTeamSize) || null,
                        minTeamSize: Number(response.data.minTeamSize) || null,
                        maxTeamSize: Number(response.data.maxTeamSize) || null,
                        captainEnabled,
                        captainSelectionMethod:
                            captainEnabled && (loadedMode === 'Random' || loadedMode === 'Manual')
                                ? 'Voting'
                                : 'Manual',
                        captainVotingDeadline: response.data.captainVotingDeadline ?? null,
                        finalDecisionThreshold: Number(response.data.finalDecisionThreshold) || 1,
                        decisionMethod: normalizeLoadedDecisionMethod(
                            response.data.decisionMethod,
                            captainEnabled,
                        ),
                        finalDecisionDeadline: response.data.finalDecisionDeadline ?? null,
                    });
                }
            } catch (error) {
                if (isAxiosError(error)) {
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
                            setConfig(createDefaultConfig(subjectId));
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
    }, [subjectId, role, navigate]);

    return {
        config,
        isConfigLoading,
        errorMessage,
    };
};
