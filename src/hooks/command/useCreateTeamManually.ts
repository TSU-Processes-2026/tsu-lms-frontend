import { createTeamManually } from '@/api/command/command';
import {
    FORBIDDEN_PAGE,
    INTERNAL_SERVER_ERROR_PAGE_URL,
    LOGIN_PAGE_URL,
} from '@/constants/paths/paths';
import { TeamCreationResponse } from '@/types/command/Team';
import { AxiosResponse, isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseCreateTeamManually {
    teams: TeamCreationResponse;
    isLoading: boolean;
    errorMessage: string | null;
}

export function useCreateTeamManually(subjectId: string, members: string[]): UseCreateTeamManually {
    const [teams, setTeams] = useState<TeamCreationResponse>({
        teams: [],
        warnings: [],
    });
    const [isLoading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        const processRequest = async () => {
            try {
                const response: AxiosResponse<TeamCreationResponse> = await createTeamManually(
                    subjectId,
                    members,
                );
                if (isMounted) {
                    setTeams({
                        teams: response.data.teams,
                        warnings: response.data.warnings,
                    });
                }
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
                if (isMounted) setLoading(false);
            }
        };
        processRequest();
        return () => {
            isMounted = false;
        };
    }, [subjectId]);

    return {
        teams,
        isLoading,
        errorMessage,
    };
}
