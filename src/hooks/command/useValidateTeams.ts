import { validateManualDistribution } from '@/api/command/command';
import {
    LOGIN_PAGE_URL,
    FORBIDDEN_PAGE,
    INTERNAL_SERVER_ERROR_PAGE_URL,
} from '@/constants/paths/paths';
import { Team, TeamValidation, ValidationDetails } from '@/types/command/Team';
import { errorMessageMapper, warningMessageMapper } from '@/utils/messageMapper';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useValidateTeams = () => {
    const [details, setDetails] = useState<ValidationDetails | null>(null);

    const handleWarningMessages = (): string[] | null => {
        if (details && details.warnings.length > 0) {
            return warningMessageMapper(details.warnings).map((warn) => warn + ';\n');
        }
        return null;
    };

    const handleErrorMessages = (): string[] | null => {
        if (details && details.errors.length > 0) {
            return errorMessageMapper(details.errors).map((error) => error + ';\n');
        }
        return null;
    };
    const navigate = useNavigate();

    const handleValidateTeams = async (
        subjectId: string | undefined,
        teamsDist: Team[],
    ): Promise<void> => {
        console.log('here');
        const members: TeamValidation = {
            teams: teamsDist.map((team) => {
                return { memberIds: team.memberIds };
            }),
        };
        try {
            const response = await validateManualDistribution(subjectId, members);
            console.log(response);
            setDetails({ ...response });
            console.log('success');
        } catch (error) {
            console.log('error');
            if (isAxiosError(error)) {
                switch (error.status) {
                    case 401: {
                        localStorage.clear();
                        navigate(LOGIN_PAGE_URL);
                        break;
                    }
                    default: {
                        console.log(error);
                        throw error;
                    }
                }
            } else {
                console.log(error);
            }
        }
    };

    return {
        details,
        handleValidateTeams,
        handleErrorMessages,
        handleWarningMessages,
    };
};
