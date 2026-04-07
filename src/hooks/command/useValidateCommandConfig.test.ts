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
    finalDecisionThreshold: 2,
    decisionMethod: 'Voting',
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
});
