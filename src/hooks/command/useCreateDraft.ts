import { fetchSubjectParticipants } from '@/api/subject/subjectsPage';
import { useEffect, useState } from 'react';
import { Participant } from '../subject/useSubjects';
import { useLoadConfig } from './useCommandConfig';
import { Members } from '@/types/command/Team';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    FORBIDDEN_PAGE,
    INTERNAL_SERVER_ERROR_PAGE_URL,
    LOGIN_PAGE_URL,
} from '@/constants/paths/paths';
import { createDraft } from '@/api/command/command';

export const useCreateDraft = (subjectId: string) => {
    const [students, setStudents] = useState<Participant[]>([]);
    const [captains, setCaptains] = useState<Members | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isStudentsLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { config, isConfigLoading } = useLoadConfig(subjectId, 'teacher');

    const [isDraftSelected, setIsDraftSelected] = useState<boolean>(false);

    const checkIsLoading = (): boolean => {
        return isStudentsLoading || isConfigLoading;
    };

    const navigate = useNavigate();

    const handleSelectTeamCaptains = (memberIds: Members): void => {
        console.log('Called handleTeamCaptains: ', memberIds);
        setCaptains(memberIds);
    };

    const handleCreateDraft = async () => {
        if (!captains?.memberIds) return false;
        try {
            const captainIds: string[] = captains.memberIds;
            await createDraft(subjectId, { captainIds: captainIds });
            setErrorMessage(null);
            setMessage('Шаблоны созданы. Капитаны назначены успешно');
            return true;
        } catch (error) {
            setMessage(null);
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
            return false;
        }
    };

    const filterParticipants = (participants: Participant[]): Participant[] => {
        return participants.filter(
            (participant) => participant.role?.toLocaleLowerCase() === 'student',
        );
    };

    useEffect(() => {
        if (!subjectId || subjectId === '' || subjectId === 'undefined') {
            setErrorMessage('Некорректный идентификатор предмета');
            setIsLoading(false);
            return;
        }
        async function loadData() {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const participantsData: Participant[] = await fetchSubjectParticipants(
                    subjectId ?? '',
                );

                const filteredParticipants: Participant[] = filterParticipants(participantsData);

                setStudents(filteredParticipants);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setErrorMessage(err.message || 'Ошибка загрузки данных');
                } else {
                    setErrorMessage('Ошибка загрузки данных');
                }
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [subjectId]);

    useEffect(() => {
        setIsDraftSelected(config.distributionMode === 'Draft');
    }, [config.distributionMode]);

    return {
        students,
        isDraftSelected,
        message,
        errorMessage,
        handleSelectTeamCaptains,
        handleCreateDraft,
        checkIsLoading,
    };
};
