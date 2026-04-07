import { TeamDistributionMode } from '@/types/command/CommandConfig';

export const mapToNumber = (mode: TeamDistributionMode): number => {
    switch (mode) {
        case 'Manual':
            return 0;
        case 'Random':
            return 1;
        case 'Students':
            return 2;
        case 'Draft':
            return 3;
        default:
            return 0;
    }
};

export const mapToType = (number: number): TeamDistributionMode => {
    switch (number) {
        case 0:
            return 'Manual';
        case 1:
            return 'Random';
        case 2:
            return 'Students';
        case 3:
            return 'Draft';
        default:
            return 'Manual';
    }
};
