import { joinToTeam, leaveTeam } from '@/api/command/command';
import { Team } from '@/types/command/Team';
import { isAxiosError } from 'axios';

import { useState } from 'react';

export const useStudentsDistribution = (subjectId: string, teamId: string) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleJoin = async (): Promise<Team> => {
        try {
            const teams: Team[] = await joinToTeam(subjectId, teamId);
            setErrorMessage(null);
            return teams.filter((team) => team.id == teamId)[0];
        } catch (error) {
            if (isAxiosError(error)) {
                setErrorMessage(error.response?.data.detail);
            }
            setErrorMessage('Не удалось обработать запрос');
            throw error;
        }
    };

    const handleLeave = async (): Promise<Team> => {
        try {
            const teams: Team[] = await leaveTeam(subjectId, teamId);
            setErrorMessage(null);
            return teams.filter((team) => team.id == teamId)[0];
        } catch (error) {
            if (isAxiosError(error)) {
                setErrorMessage(error.response?.data.detail);
            }
            setErrorMessage('Не удалось обработать запрос');
            throw error;
        }
    };

    return {
        errorMessage,
        handleJoin,
        handleLeave,
    };
};
