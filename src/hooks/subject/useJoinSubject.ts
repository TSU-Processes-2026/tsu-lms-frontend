import { getSubjects, joinSubject } from '@/api/subject/subject';
import { INTERNAL_SERVER_ERROR_PAGE_URL, LOGIN_PAGE_URL } from '@/constants/paths/paths';
import { Subject } from '@/types/subject/Subject';
import { isAxiosError } from 'axios';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useJoinSubject = () => {
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const handleSelectSubject = (e: ChangeEvent<HTMLInputElement>) => {
        setSelectedSubject(e.target.value);
    };
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent): Promise<void> => {
        e.preventDefault();
        try {
            await joinSubject(selectedSubject);
        } catch (error) {
            if (isAxiosError(error)) {
                if (error.response?.status === 401) {
                    localStorage.clear();
                    navigate(LOGIN_PAGE_URL);
                } else if (error.response?.status === 404) {
                    setErrorMessage('Предмет не найден');
                } else {
                    navigate(INTERNAL_SERVER_ERROR_PAGE_URL);
                }
            }
        }
    };

    return {
        selectedSubject,
        errorMessage,
        setSelectedSubject,
        handleSelectSubject,
        handleSubmit,
    };
};
