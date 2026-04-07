import { buildRandomVotes, resolveCaptainVoting } from './captainVoting';

describe('captainVoting utils', () => {
    it('should build random votes for all participants', () => {
        const randomValues = [0.1, 0.8, 0.8];
        let randomIndex = 0;
        const randomProvider = () => randomValues[randomIndex++] ?? 0;
        const members = [
            { userId: 'u1', username: 'One' },
            { userId: 'u2', username: 'Two' },
            { userId: 'u3', username: 'Three' },
        ];

        const votes = buildRandomVotes(members, randomProvider);

        expect(votes).toEqual({
            u1: 1,
            u2: 0,
            u3: 2,
        });
    });

    it('should resolve tie and mark random resolution', () => {
        const voting = resolveCaptainVoting(
            {
                u1: 2,
                u2: 2,
                u3: 1,
            },
            () => 0.6,
        );

        expect(voting.tieResolvedByRandom).toBe(true);
        expect(voting.tieCandidates).toEqual(['u1', 'u2']);
        expect(voting.winnerId).toBe('u2');
    });
});
