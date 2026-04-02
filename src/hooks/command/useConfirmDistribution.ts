import { confirmTeamDistribution, fetchUnassignedStudents } from '@/api/command/command';
import {
    FORBIDDEN_PAGE,
    INTERNAL_SERVER_ERROR_PAGE_URL,
    LOGIN_PAGE_URL,
} from '@/constants/paths/paths';
import { ConfirmationResponse, UnAssignedStudents, ValidationDetails } from '@/types/command/Team';
import { AxiosResponse, isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseConfirmation {
    confirmation: ConfirmationResponse;
    validationDetails: ValidationDetails;
    isLoading: boolean;
}

export function useConfirmation(subjectId: string): UseConfirmation {
    const [confirmation, setConfirmation] = useState<ConfirmationResponse>({
        isFinalized: false,
        finalizedAt: '',
    });
    const [validationDetails, setDetails] = useState<ValidationDetails>({
        isValid: true,
        errors: [],
        warnings: [],
    });
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState<boolean>(false);
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        const processRequest = async () => {
            try {
                const response: AxiosResponse<ConfirmationResponse> =
                    await confirmTeamDistribution(subjectId);
                if (isMounted) {
                    setConfirmation({
                        isFinalized: response.data.isFinalized,
                        finalizedAt: response.data.finalizedAt,
                    });
                }
            } catch (error) {
                if (isAxiosError(error)) {
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
                        case 401: {
                            localStorage.clear();
                            navigate(LOGIN_PAGE_URL);
                            break;
                        }
                        case 403: {
                            navigate(FORBIDDEN_PAGE);
                            break;
                        }
                        case 404: {
                            navigate('*');
                            break;
                        }
                        default: {
                            navigate(INTERNAL_SERVER_ERROR_PAGE_URL);
                            break;
                        }
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        processRequest();
        return () => {
            isMounted = false;
        };
    }, [subjectId]);

    return {
        confirmation,
        validationDetails,
        isLoading,
    };
}

interface UseManualDistribution {
    unassignedStudents: UnAssignedStudents;
    isLoading: boolean;
    errorMessage: string | null;
}

export function useManualDistribution(subjectId: string): UseManualDistribution {
    const [unassignedStudents, setUnassignedStudents] = useState<UnAssignedStudents>({
        subjectId: subjectId,
        studentIds: [],
        students: [],
    });
    const [isLoading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        const processRequest = async () => {
            try {
                const response: AxiosResponse<UnAssignedStudents> =
                    await fetchUnassignedStudents(subjectId);
                if (isMounted) {
                    setUnassignedStudents({
                        subjectId: response.data.subjectId,
                        studentIds: response.data.studentIds,
                        students: response.data.students,
                    });
                }
            } catch (error) {
                if (isAxiosError(error)) {
                    switch (error.status) {
                        case 400: {
                            setErrorMessage(
                                error.response?.data.detail || 'Переданы неверные параметры',
                            );
                            break;
                        }
                        case 401: {
                            localStorage.clear();
                            navigate(LOGIN_PAGE_URL);
                            break;
                        }
                        case 403: {
                            navigate(FORBIDDEN_PAGE);
                            break;
                        }
                        case 404: {
                            navigate('*');
                            break;
                        }
                        default: {
                            navigate(INTERNAL_SERVER_ERROR_PAGE_URL);
                            break;
                        }
                    }
                } else {
                    setErrorMessage('Не удалось обработать запрос');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        processRequest();
        return () => {
            isMounted = false;
        };
    }, [subjectId]);

    return {
        unassignedStudents,
        isLoading,
        errorMessage,
    };
}
