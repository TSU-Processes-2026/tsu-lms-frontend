import { createTeamByStudent, joinToTeam, leaveTeam } from '@/api/command/command';
import { Team, TeamCreationResponse } from '@/types/command/Team';
import { isAxiosError } from 'axios';

import { ChangeEvent, useState } from 'react';
import { useErrorHandler } from '../error/useErrorHandler';

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

export const useCreateTeamByStudent = (subjectId: string) => {
    const [teamName, setName] = useState<string>('');
    const [teams, setTeams] = useState<TeamCreationResponse | null>(null);
    const [isLoading, setLoading] = useState<boolean>(false);
    const { errorMessage, handleError, clearError } = useErrorHandler();

    const handleSetTeamName = (e: ChangeEvent<HTMLInputElement>) => setName(e.target.value.trim());
    const handleCreateTeam = async (): Promise<boolean> => {
        setLoading(true);
        try {
            await createTeamByStudent(subjectId, teamName);
            clearError();
            return true;
        } catch (error) {
            handleError(error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        teamName,
        errorMessage,
        isLoading,
        handleSetTeamName,
        handleCreateTeam,
    };
};
