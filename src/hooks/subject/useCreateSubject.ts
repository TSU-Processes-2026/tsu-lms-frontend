import { createSubject } from '@/api/subject/subject';
import {
    SUBJECT_DESCRIPTION_MAX_LENGTH_ERROR,
    SUBJECT_TITLE_EMPTY,
    SUBJECT_TITLE_ERROR,
} from '@/constants/error/errorMessages';

import { LOGIN_PAGE_URL, SUBJECT_PAGE_PREFIX } from '@/constants/paths/paths';
import { BAD_REQUEST, SERVER_ERROR, UNAUTHORIZED_TOKEN } from '@/constants/response/errorMessages';
import { CreateSubjectResponse } from '@/types/subject/CreateSubject';
import { AxiosResponse, isAxiosError } from 'axios';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useCreateSubject = (onClose: () => void) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    const isFormValid = (): boolean => {
        return validateTitle() && validateDescription();
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setErrorMessage('');
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!isFormValid()) return;

        try {
            const response: AxiosResponse<CreateSubjectResponse> = await createSubject({
                title: title,
                description: description,
            });
            resetForm();
            onClose();
            navigate(SUBJECT_PAGE_PREFIX + response.data.id);
        } catch (error) {
            if (isAxiosError(error)) {
                if (error.response?.status === 400) {
                    setErrorMessage(error.response.data.detail || BAD_REQUEST);
                } else if (error.response?.status === 401) {
                    setErrorMessage(error.response.data.detail || UNAUTHORIZED_TOKEN);
                    localStorage.clear();
                    navigate(LOGIN_PAGE_URL);
                } else {
                    setErrorMessage(error.response?.data.detail || SERVER_ERROR);
                }
            } else {
                setErrorMessage('Не удалось обработать запрос');
            }
        } finally {
            return;
        }
    };

    const validateTitle = (): boolean => {
        if (title === null || title === undefined || title.trim() === '') {
            setErrorMessage(SUBJECT_TITLE_EMPTY);
            return false;
        }
        if (title.trim().length < 3 || title.trim().length > 50) {
            setErrorMessage(SUBJECT_TITLE_ERROR);
            return false;
        }
        return true;
    };

    const validateDescription = (): boolean => {
        if (description === null || description === undefined || description.trim() === '') {
            setErrorMessage('Поле с описанием не может быть пустым');
            return false;
        }
        if (description.trim().length > 2000) {
            setErrorMessage(SUBJECT_DESCRIPTION_MAX_LENGTH_ERROR);
            return false;
        }
        return true;
    };

    return {
        title,
        description,
        errorMessage,
        setTitle,
        setDescription,
        setErrorMessage,
        handleSubmit,
        validateTitle,
        validateDescription,
        isFormValid,
    };
};
