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
    isTeamLoading: boolean;
    errorMessage: string | null;
    setTeams: (newTeams: Team[]) => void;
}

export const useLoadTeams = (subjectId: string | undefined): UseLoadTeams => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [isTeamLoading, setIsTeamLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        setIsTeamLoading(true);
        const processRequest = async () => {
            try {
                const response = await fetchSubjectTeams(subjectId);
                if (isMounted) {
                    setTeams(
                        response.data.map((team) => ({
                            ...team,
                            memberIds:
                                team.memberIds && team.memberIds.length > 0
                                    ? team.memberIds
                                    : (team.members || []).map((member) => member.userId),
                            captainId: team.captainId ?? null,
                            captain:
                                team.captain ??
                                team.members.find((member) => member.userId === team.captainId) ??
                                null,
                            captainSelectionMethod: team.captainSelectionMethod ?? null,
                            captainVoting: team.captainVoting ?? null,
                            finalDecision: team.finalDecision ?? null,
                        })),
                    );
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
                if (isMounted) setIsTeamLoading(false);
            }
        };
        processRequest();
        return () => {
            isMounted = false;
        };
    }, [subjectId, navigate]);

    return {
        teams,
        isTeamLoading,
        errorMessage,
        setTeams,
    };
};
