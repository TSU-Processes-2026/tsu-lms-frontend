import { renderHook } from '@testing-library/react';
import { useValidateCommandConfig } from './useValidateCommandConfig';
import { TeamConfig } from '@/types/command/CommandConfig';

const buildConfig = (overrides: Partial<TeamConfig> = {}): TeamConfig => ({
    subjectId: 'subject-1',
    distributionMode: 'Manual',
    fixedTeamsCount: 2,
    fixedTeamSize: 3,
    minTeamSize: null,
    maxTeamSize: null,
    requiresCaptain: false,
    captainSelectionMode: 'Manual',
    captainVotingDeadlineDays: null,
    requiresDecision: false,
    decisionMode: null,
    decisionDeadlineDays: null,
    requiredDecisionVotes: null,
    isFinalized: false,
    finalizedAt: null,
    warnings: [],
    ...overrides,
});

describe('useValidateCommandConfig', () => {
    it('validates divisibility for fixed team size', () => {
        const { result } = renderHook(() => useValidateCommandConfig());

        const error = result.current.validateParams(7, buildConfig({ fixedTeamSize: 3 }));

        expect(error).toContain('должно делиться без остатка');
    });

    it('requires captain in draft mode', () => {
        const { result } = renderHook(() => useValidateCommandConfig());

        const error = result.current.validateParams(
            6,
            buildConfig({ distributionMode: 'Draft', requiresCaptain: false }),
        );

        expect(error).toBe('В режиме драфта капитан обязателен');
    });

    it('requires decision deadline when final decision is enabled', () => {
        const { result } = renderHook(() => useValidateCommandConfig());

        const error = result.current.validateParams(
            5,
            buildConfig({
                fixedTeamSize: 5,
                fixedTeamsCount: 1,
                requiresDecision: true,
                decisionMode: 'Voting',
                requiredDecisionVotes: 3,
            }),
        );

        expect(error).toBe('Укажите срок принятия итогового решения');
    });

    it('validates captain voting period is before decision period', () => {
        const { result } = renderHook(() => useValidateCommandConfig());

        const error = result.current.validateParams(
            6,
            buildConfig({
                distributionMode: 'Random',
                requiresCaptain: true,
                requiresDecision: true,
                decisionMode: 'CaptainDecides',
                captainSelectionMode: 'Voting',
                captainVotingDeadlineDays: 10,
                decisionDeadlineDays: 9,
                requiredDecisionVotes: 1,
            }),
        );

        expect(error).toBe('Срок выбора капитана должен быть раньше срока итогового решения');
    });
});
