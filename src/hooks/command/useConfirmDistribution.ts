import { confirmTeamDistribution } from '@/api/command/command';
import { ConfirmationResponse, ValidationDetails } from '@/types/command/Team';
import { AxiosResponse, isAxiosError } from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseConfirmation {
    confirmation: ConfirmationResponse | null;
    validationDetails: ValidationDetails | null;
    isLoading: boolean;
    handleFinalize: () => {};
}

export function useConfirmation(subjectId: string): UseConfirmation {
    const [confirmation, setConfirmation] = useState<ConfirmationResponse | null>(null);
    const [validationDetails, setDetails] = useState<ValidationDetails | null>(null);
    const [isLoading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const handleFinalize = async () => {
        try {
            const response: AxiosResponse<ConfirmationResponse> =
                await confirmTeamDistribution(subjectId);
            setDetails(null);
            setConfirmation({
                isFinalized: response.data.isFinalized,
                finalizedAt: response.data.finalizedAt,
            });
        } catch (error) {
            if (isAxiosError(error)) {
                setConfirmation(null);
                switch (error.status) {
                    case 400: {
                        const errorRes: ValidationDetails = error.response?.data;
                        setDetails({
                            isValid: errorRes.isValid || false,
                            errors: errorRes.errors || [],
                            warnings: errorRes.warnings || [],
                        });
                        break;
                    }
                    default:
                        console.log(error.response);
                }
            }
        } finally {
            setLoading(false);
        }
    };
    return {
        confirmation,
        validationDetails,
        isLoading,
        handleFinalize,
    };
}
