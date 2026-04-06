import {
    createTeamManually,
    distributeWithManual,
    fetchUnassignedStudents,
} from '@/api/command/command';
import {
    FORBIDDEN_PAGE,
    INTERNAL_SERVER_ERROR_PAGE_URL,
    LOGIN_PAGE_URL,
} from '@/constants/paths/paths';
import {
    Members,
    TeamCreationResponse,
    TeamRequest,
    UnAssignedStudents,
} from '@/types/command/Team';
import { AxiosResponse, isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseCreateTeamManually {
    teams: TeamCreationResponse;
    unassigned: UnAssignedStudents;
    isLoading: boolean;
    isCreating: boolean;
    errorMessage: string | null;
    setErrorMessage: (message: string | null) => void;
    processCreateRequest: (members: Members) => Promise<boolean | void>;
}

export function useCreateTeamManually(subjectId: string): UseCreateTeamManually {
    const [teams, setTeams] = useState<TeamCreationResponse>({
        teams: [],
        warnings: [],
    });
    const [unassigned, setUnassigned] = useState<UnAssignedStudents>({
        subjectId: subjectId,
        studentIds: [],
        students: [],
    });
    const [isLoading, setLoading] = useState<boolean>(false);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const navigate = useNavigate();

    const processCreateRequest = async (members: Members): Promise<boolean | void> => {
        console.log(members);
        setIsCreating(true);
        try {
            const response: AxiosResponse<TeamCreationResponse> = await createTeamManually(
                subjectId,
                members,
            );
            setTeams({
                teams: response.data.teams,
                warnings: response.data.warnings,
            });
            return true;
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
                        localStorage.clear();
                        navigate(LOGIN_PAGE_URL);
                        break;
                    }
                    case 403: {
                        navigate(FORBIDDEN_PAGE);
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
            setIsCreating(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        const loadUnassignedStudents = async () => {
            try {
                const response: UnAssignedStudents = await fetchUnassignedStudents(subjectId);
                if (isMounted) {
                    setUnassigned({
                        subjectId: response.subjectId,
                        studentIds: response.studentIds,
                        students: response.students,
                    });
                }
                console.log('unassigned: ', unassigned);
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
                            localStorage.clear();
                            navigate(LOGIN_PAGE_URL);
                            break;
                        }
                        case 403: {
                            navigate(FORBIDDEN_PAGE);
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
                if (isMounted) setLoading(false);
            }
        };
        loadUnassignedStudents();
        return () => {
            isMounted = false;
        };
    }, [subjectId]);

    return {
        teams,
        unassigned,
        isLoading,
        isCreating,
        errorMessage,
        setErrorMessage,
        processCreateRequest,
    };
}

export function useSendAllTeamManually(subjectId: string) {
    const [isLoading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const sendAll = async (teams: TeamRequest): Promise<boolean> => {
        setLoading(true);
        try {
            await distributeWithManual(subjectId, teams);
            return true;
        } catch (error) {
            setErrorMessage('Не удалось выполнить запрос');
            return false;
        } finally {
            setLoading(false);
        }
    };
    return {
        isLoading,
        errorMessage,
        sendAll,
    };
}
