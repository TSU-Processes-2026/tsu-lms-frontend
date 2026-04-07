import { TeamDistributionMode } from '@/types/command/CommandConfig';
import { mapToNumber } from './distributionModeMapper';

const distributionModeByLegacyNumber: Record<number, TeamDistributionMode> = {
    0: 'Manual',
    1: 'Random',
    2: 'Students',
    3: 'Draft',
};

const distributionModes = new Set<TeamDistributionMode>(['Manual', 'Random', 'Students', 'Draft']);

export const normalizeDistributionMode = (value: unknown): TeamDistributionMode => {
    if (typeof value === 'number' && distributionModeByLegacyNumber[value]) {
        return distributionModeByLegacyNumber[value];
    }

    if (typeof value === 'string') {
        const normalized = value.trim();
        if (distributionModes.has(normalized as TeamDistributionMode)) {
            return normalized as TeamDistributionMode;
        }
    }

    return 'Manual';
};

export const normalizeDistributionModeLegacy = (value: TeamDistributionMode): number => {
    return mapToNumber(value);
};

export const distributionModeLabels: Record<TeamDistributionMode, string> = {
    Manual: 'Ручное',
    Random: 'Случайное',
    Students: 'Самоорганизация студентов',
    Draft: 'Драфт',
};
