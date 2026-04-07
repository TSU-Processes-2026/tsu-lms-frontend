import { CaptainVotingSummary, TeamMember } from '@/types/command/Team';

type RandomProvider = () => number;

export const buildRandomVotes = (
    members: TeamMember[],
    randomProvider: RandomProvider = Math.random,
): Record<string, number> => {
    const memberIds = members.map((member) => member.userId);
    const initialVotes = memberIds.reduce<Record<string, number>>((acc, userId) => {
        acc[userId] = 0;
        return acc;
    }, {});

    if (memberIds.length === 0) {
        return initialVotes;
    }

    members.forEach(() => {
        const voteIndex = Math.floor(randomProvider() * memberIds.length);
        const votedUserId = memberIds[voteIndex] ?? memberIds[0];
        initialVotes[votedUserId] = (initialVotes[votedUserId] ?? 0) + 1;
    });

    return initialVotes;
};

export const resolveCaptainVoting = (
    votes: Record<string, number>,
    randomProvider: RandomProvider = Math.random,
): CaptainVotingSummary => {
    const voteEntries = Object.entries(votes);

    if (voteEntries.length === 0) {
        return {
            votes: {},
            tieCandidates: [],
            tieResolvedByRandom: false,
            winnerId: null,
            resolvedAt: new Date().toISOString(),
        };
    }

    const maxVotes = Math.max(...voteEntries.map(([, votesCount]) => votesCount));
    const tieCandidates = voteEntries
        .filter(([, votesCount]) => votesCount === maxVotes)
        .map(([userId]) => userId);

    const tieResolvedByRandom = tieCandidates.length > 1;
    const winnerIndex = tieResolvedByRandom
        ? Math.floor(randomProvider() * tieCandidates.length)
        : 0;
    const winnerId = tieCandidates[winnerIndex] ?? tieCandidates[0] ?? null;

    return {
        votes,
        tieCandidates,
        tieResolvedByRandom,
        winnerId,
        resolvedAt: new Date().toISOString(),
    };
};
