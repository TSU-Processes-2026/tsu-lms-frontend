import { Members } from '@/types/command/Team';
import { useState } from 'react';

export const useSelectCaptains = () => {
    return {
        captainIds,
        handleSelectTeamCaptains,
    };
};
