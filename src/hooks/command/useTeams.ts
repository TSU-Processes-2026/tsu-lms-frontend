import { fetchSubjectTeams } from '@/api/command/command';
import { Team } from '@/types/command/Team';
import { useState, useEffect } from 'react';
import { Participant } from '../subject/useSubjects';

export const useTeams = (
    subjectId: string | undefined,
    participants: Record<string, Participant[]>,
) => {
    const loadedParticipants: Participant[] = participants[subjectId || ''];
    const [teams, setTeams] = useState<Team[]>([]);
    const loadTeams = async () => {
        try {
            const response = await fetchSubjectTeams(subjectId);
            setTeams(response.data);
        } catch (error) {}
    };

    useEffect(() => {
        loadTeams();
    }, [subjectId]);

    const mapParticipantsWithTeamIds = (teamId: string): Participant[] => {
        const team: Team = teams.filter((item) => item.id === teamId)[0];
        if (team) {
            const teamParticipants = loadedParticipants.filter((item) =>
                team.memberIds.includes(item.userId),
            );
            return teamParticipants;
        }
        return [];
    };

    return {
        teams,
        mapParticipantsWithTeamIds,
    };
};
