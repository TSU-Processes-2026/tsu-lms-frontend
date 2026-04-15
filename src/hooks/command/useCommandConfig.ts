import { fetchConfig, saveConfigParams } from '@/api/command/command';
import { INTERNAL_SERVER_ERROR_PAGE_URL } from '@/constants/paths/paths';
import {
    FinalDecisionMethod,
    TeamConfig,
    TeamDistributionMode,
} from '@/types/command/CommandConfig';

import { AxiosResponse, isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { normalizeCaptainSelectionMode, normalizeDistributionMode } from '@/utils/teamConfig';

const createDefaultConfig = (subjectId: string): TeamConfig => ({
    subjectId,
    distributionMode: 'Manual',
    fixedTeamsCount: 0,
    fixedTeamSize: null,
    minTeamSize: null,
    maxTeamSize: null,
    requiresCaptain: false,
    captainSelectionMode: 'Manual',
    captainVotingDeadlineDays: null,
    requiresDecision: false,
    decisionMode: null,
    decisionDeadlineDays: null,
    requiredDecisionVotes: null,
    isFinalized: false,
    finalizedAt: null,
    warnings: [],
});

const normalizeDecisionMethod = (
    requiresCaptain: boolean,
    requiresDecision: boolean,
): FinalDecisionMethod | null => {
    if (!requiresDecision) {
        return null;
    }

    return requiresCaptain ? 'CaptainDecides' : 'Voting';
};

const normalizeLoadedDecisionMethod = (
    decisionMethod: FinalDecisionMethod | null | undefined,
    requiresCaptain: boolean,
    requiresDecision: boolean,
): FinalDecisionMethod | null => {
    if (!requiresDecision) {
        return null;
    }

    if (!requiresCaptain) {
        return 'Voting';
    }

    if (decisionMethod === 'CaptainDecides') {
        return decisionMethod;
    }

    return 'CaptainDecides';
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

    const handleDistributionMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextMode = normalizeDistributionMode(e.target.value);
        setConfig((prev) => {
            const requiresCaptain = nextMode === 'Draft' ? true : prev.requiresCaptain;
            const captainSelectionMode =
                nextMode === 'Random' || nextMode === 'Manual' ? 'Voting' : 'Manual';
            return {
                ...prev,
                distributionMode: nextMode,
                requiresCaptain,
                captainSelectionMode: captainSelectionMode,
                decisionMode: normalizeDecisionMethod(requiresCaptain, prev.requiresDecision),
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

    const handleCaptainSelectionMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setConfig((prev) => {
            const distributionMode = normalizeDistributionMode(prev.distributionMode);
            const mode = normalizeCaptainSelectionMode(e.target.value);
            return {
                ...prev,
                captainSelectionMode:
                    distributionMode === 'Manual' || distributionMode === 'Random'
                        ? 'Voting'
                        : mode,
            };
        });
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
            maxTeamSize: null,
            minTeamSize: null,
        }));
        setIsSuccess(false);
    };

    const handleMinSize = (value: string | null) => {
        setConfig((prev) => ({
            ...prev,
            fixedTeamSize: null,
            minTeamSize: value ? parsePositiveNumber(value) : null,
        }));
        setIsSuccess(false);
    };

    const handleMaxSize = (value: string | null) => {
        setConfig((prev) => ({
            ...prev,
            fixedTeamSize: null,
            maxTeamSize: value ? parsePositiveNumber(value) : null,
        }));
        setIsSuccess(false);
    };

    const handleRequiresCaptain = (enabled: boolean) => {
        setConfig((prev) => {
            const mode = normalizeDistributionMode(prev.distributionMode);
            const requiresCaptain = mode === 'Draft' ? true : enabled;
            const captainSelectionMode =
                mode === 'Random' || mode === 'Manual' ? 'Voting' : 'Manual';
            return {
                ...prev,
                requiresCaptain,
                decisionMode: normalizeDecisionMethod(requiresCaptain, prev.requiresDecision),
                captainSelectionMode: captainSelectionMode,
                captainVotingDeadlineDays: requiresCaptain ? prev.captainVotingDeadlineDays : null,
            };
        });
        setIsSuccess(false);
    };

    const handleRequiresDecision = (enabled: boolean) => {
        setConfig((prev) => ({
            ...prev,
            requiresDecision: enabled,
            decisionMode: normalizeDecisionMethod(prev.requiresCaptain, enabled),
            decisionDeadlineDays: enabled ? prev.decisionDeadlineDays : null,
            requiredDecisionVotes: enabled ? prev.requiredDecisionVotes : null,
        }));
        setIsSuccess(false);
    };

    const handleCaptainVotingDeadlineDays = (value: string) => {
        setConfig((prev) => ({
            ...prev,
            captainVotingDeadlineDays: parsePositiveNumber(value),
        }));
        setIsSuccess(false);
    };

    const handleDecisionDeadlineDays = (value: string) => {
        setConfig((prev) => ({
            ...prev,
            decisionDeadlineDays: parsePositiveNumber(value),
        }));
        setIsSuccess(false);
    };

    const handleRequiredDecisionVotes = (value: string) => {
        setConfig((prev) => ({
            ...prev,
            requiredDecisionVotes: parsePositiveNumber(value),
        }));
        setIsSuccess(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const preparedConfig: TeamConfig = {
                ...config,
                decisionMode: normalizeDecisionMethod(
                    config.requiresCaptain,
                    config.requiresDecision,
                ),
            };

            const response: AxiosResponse<TeamConfig> = await saveConfigParams(subjectId, {
                distributionMode: normalizeDistributionMode(preparedConfig.distributionMode),
                fixedTeamsCount: preparedConfig.fixedTeamsCount,
                fixedTeamSize: segregationType === 'fixed' ? preparedConfig.fixedTeamSize : null,
                minTeamSize: segregationType === 'range' ? preparedConfig.minTeamSize : null,
                maxTeamSize: segregationType === 'range' ? preparedConfig.maxTeamSize : null,
                requiresCaptain: preparedConfig.requiresCaptain,
                captainSelectionMode: preparedConfig.captainSelectionMode,
                captainVotingDeadlineDays: preparedConfig.captainVotingDeadlineDays,
                requiresDecision: preparedConfig.requiresDecision,
                decisionMode: normalizeDecisionMethod(
                    preparedConfig.requiresCaptain,
                    preparedConfig.requiresDecision,
                ),
                decisionDeadlineDays: preparedConfig.decisionDeadlineDays,
                requiredDecisionVotes: preparedConfig.requiredDecisionVotes,
            });

            const loadedMode = normalizeDistributionMode(response.data.distributionMode);
            const requiresCaptain = loadedMode === 'Draft' ? true : Boolean(response.data.requiresCaptain);
            const requiresDecision = Boolean(response.data.requiresDecision);

            setConfig({
                ...createDefaultConfig(subjectId),
                ...response.data,
                distributionMode: loadedMode,
                requiresCaptain,
                captainSelectionMode: response.data.captainSelectionMode || 'Manual',
                captainVotingDeadlineDays: response.data.captainVotingDeadlineDays ?? null,
                requiresDecision,
                decisionMode: normalizeLoadedDecisionMethod(
                    response.data.decisionMode,
                    requiresCaptain,
                    requiresDecision,
                ),
                decisionDeadlineDays: response.data.decisionDeadlineDays ?? null,
                requiredDecisionVotes: response.data.requiredDecisionVotes ?? null,
            });
            setErrorMessage(null);
            setIsSuccess(true);
        } catch (error) {
            if (isAxiosError(error)) {
                if (error.response?.status === 400) {
                    console.log(error.response.data);
                    setErrorMessage(error.response.data.detail || 'Переданы неверные параметры');
                } else if (error.response?.status === 401) {
                    setErrorMessage(
                        error.response.data.detail || 'Требуется повторная авторизация',
                    );
                } else {
                    setErrorMessage(error.response?.data.detail || 'Ошибка сервера');
                }
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
                    const loadedMode = normalizeDistributionMode(response.data.distributionMode);
                    const loadedCaptainSelectionMode = normalizeCaptainSelectionMode(
                        response.data.captainSelectionMode,
                    );
                    const fixedTeamSize = Number(response.data.fixedTeamSize) || null;
                    const minTeamSize = Number(response.data.minTeamSize) || null;
                    const maxTeamSize = Number(response.data.maxTeamSize) || null;
                    const requiresCaptain =
                        loadedMode === 'Draft' ? true : Boolean(response.data.requiresCaptain);
                    const requiresDecision = Boolean(response.data.requiresDecision);
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
                        requiresCaptain,
                        captainSelectionMode: loadedCaptainSelectionMode,
                        captainVotingDeadlineDays: response.data.captainVotingDeadlineDays ?? null,
                        requiresDecision,
                        decisionMode: normalizeLoadedDecisionMethod(
                            response.data.decisionMode,
                            requiresCaptain,
                            requiresDecision,
                        ),
                        decisionDeadlineDays: response.data.decisionDeadlineDays ?? null,
                        requiredDecisionVotes: response.data.requiredDecisionVotes ?? null,
                    });
                }
            } catch (error) {
                if (isAxiosError(error)) {
                    switch (error.status) {
                        case 400: {
                            console.log(error.response?.data);
                            break;
                        }
                        case 401: {
                            console.log(
                                'Failed create config in useCommandConfig: ',
                                error.response?.data,
                            );
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
        handleRequiresCaptain,
        handleRequiresDecision,
        handleCaptainVotingDeadlineDays,
        handleCaptainSelectionMode,
        handleDecisionDeadlineDays,
        handleRequiredDecisionVotes,
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
                console.log('Received config: ', response.data);
                if (isMounted) {
                    const loadedMode: TeamDistributionMode = normalizeDistributionMode(
                        response.data.distributionMode,
                    );
                    const requiresCaptain =
                        loadedMode === 'Draft' ? true : Boolean(response.data.requiresCaptain);
                    const requiresDecision = Boolean(response.data.requiresDecision);
                    setConfig({
                        ...createDefaultConfig(subjectId),
                        ...response.data,
                        subjectId,
                        distributionMode: loadedMode,
                        fixedTeamsCount: Number(response.data.fixedTeamsCount) || 0,
                        fixedTeamSize: Number(response.data.fixedTeamSize) || null,
                        minTeamSize: Number(response.data.minTeamSize) || null,
                        maxTeamSize: Number(response.data.maxTeamSize) || null,
                        requiresCaptain,
                        captainSelectionMode:
                            requiresCaptain && (loadedMode === 'Random' || loadedMode === 'Manual')
                                ? 'Voting'
                                : 'Manual',
                        captainVotingDeadlineDays: response.data.captainVotingDeadlineDays ?? null,
                        requiresDecision,
                        decisionMode: normalizeLoadedDecisionMethod(
                            response.data.decisionMode,
                            requiresCaptain,
                            requiresDecision,
                        ),
                        decisionDeadlineDays: response.data.decisionDeadlineDays ?? null,
                        requiredDecisionVotes: response.data.requiredDecisionVotes ?? null,
                    });

                    setConfig({
                        ...createDefaultConfig(subjectId),
                        ...response.data, // сначала все, что пришло с сервера
                        subjectId,
                        // принудительно нормализуем только distributionMode
                        distributionMode: loadedMode,
                        // числовые поля: если пришли null/undefined, оставляем как есть (не заменяем на 0)
                        fixedTeamsCount: response.data.fixedTeamsCount ?? 0,
                        fixedTeamSize: response.data.fixedTeamSize ?? null,
                        minTeamSize: response.data.minTeamSize ?? null,
                        maxTeamSize: response.data.maxTeamSize ?? null,

                        requiresCaptain:
                            loadedMode === 'Draft'
                                ? true
                                : (response.data.requiresCaptain ?? false),

                        captainSelectionMode:
                            response.data.captainSelectionMode ??
                            ((loadedMode === 'Random' || loadedMode === 'Manual') && requiresCaptain
                                ? 'Voting'
                                : 'Manual'),
                        captainVotingDeadlineDays: response.data.captainVotingDeadlineDays ?? null,
                        requiresDecision,
                        decisionMode: normalizeLoadedDecisionMethod(
                            response.data.decisionMode,
                            requiresCaptain,
                            requiresDecision,
                        ),
                        decisionDeadlineDays: response.data.decisionDeadlineDays ?? null,
                    });
                }
            } catch (error) {
                if (isAxiosError(error)) {
                    switch (error.status) {
                        case 400: {
                            console.log(error.response?.data);
                            break;
                        }
                        case 401: {
                            console.log(
                                'Failed load configuration in useLoadConfig: ',
                                error.response?.data,
                            );
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
        setConfig,
    };
};
