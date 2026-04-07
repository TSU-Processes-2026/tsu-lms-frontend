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
    captainEnabled: false,
    captainSelectionMethod: 'Manual',
    captainVotingDeadline: null,
    finalDecisionThreshold: 2,
    decisionMethod: 'Voting',
    finalDecisionDeadline: null,
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
            buildConfig({ distributionMode: 'Draft', captainEnabled: false }),
        );

        expect(error).toBe('В режиме драфта капитан обязателен');
    });

    it('validates final decision threshold bounds', () => {
        const { result } = renderHook(() => useValidateCommandConfig());

        const error = result.current.validateParams(
            5,
            buildConfig({ fixedTeamSize: 5, fixedTeamsCount: 1, finalDecisionThreshold: 7 }),
        );

        expect(error).toBe('Порог принятия решения должен быть в диапазоне от 1 до 5');
    });

    it('validates captain voting deadline is before final decision deadline', () => {
        const { result } = renderHook(() => useValidateCommandConfig());

        const error = result.current.validateParams(
            6,
            buildConfig({
                distributionMode: 'Random',
                captainEnabled: true,
                decisionMethod: 'CaptainDecision',
                captainVotingDeadline: '2026-01-10T15:00:00.000Z',
                finalDecisionDeadline: '2026-01-09T15:00:00.000Z',
            }),
        );

        expect(error).toBe(
            'Дедлайн выбора капитана должен быть раньше дедлайна итогового решения',
        );
    });
});
