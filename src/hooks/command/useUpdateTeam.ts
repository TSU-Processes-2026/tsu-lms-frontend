import { updateTeamMembers } from '@/api/command/command';
import {
    FORBIDDEN_PAGE,
    INTERNAL_SERVER_ERROR_PAGE_URL,
    LOGIN_PAGE_URL,
} from '@/constants/paths/paths';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useUpdateTeam(subjectId: string) {
    const [teamId, setTeamId] = useState<string | null>(null);
    const [newMembers, setNewMembers] = useState<string[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const navigate = useNavigate();
    const handleSelectTeamId = (selectedTeamId: string) => setTeamId(selectedTeamId);
    const handleSelectTeamMembers = (memberIds: string[]) => {
        setNewMembers(memberIds);
    };
    const handleUpdateTeam = async (): Promise<void> => {
        if (!newMembers || !teamId) return;
        setIsLoading(true);
        try {
            await updateTeamMembers(subjectId, teamId, newMembers);
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
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        errorMessage,
        handleSelectTeamId,
        handleSelectTeamMembers,
        handleUpdateTeam,
    };
}
