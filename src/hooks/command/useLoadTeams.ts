import { fetchSubjectTeams } from '@/api/command/command';
import { Team } from '@/types/command/Team';
import { useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    LOGIN_PAGE_URL,
    FORBIDDEN_PAGE,
    INTERNAL_SERVER_ERROR_PAGE_URL,
} from '@/constants/paths/paths';

interface UseLoadTeams {
    teams: Team[];
    isLoading: boolean;
    errorMessage: string | null;
    setTeams: (newTeams: Team[]) => void;
}

export const useLoadTeams = (subjectId: string | undefined): UseLoadTeams => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        const processRequest = async () => {
            try {
                const response = await fetchSubjectTeams(subjectId);
                if (isMounted) {
                    setTeams(response.data);
                    console.log('Teams: ' + response);
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
                if (isMounted) setIsLoading(false);
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
        setTeams,
    };
};
