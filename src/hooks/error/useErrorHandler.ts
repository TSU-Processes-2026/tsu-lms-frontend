import { useCallback, useState } from 'react';
import { isAxiosError } from 'axios';

export const useErrorHandler = () => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleError = useCallback((error: unknown) => {
        if (isAxiosError(error)) {
            console.log(error.response?.data);
            switch (error.response?.status) {
                case 400:
                    setErrorMessage(error.response?.data?.detail || 'Ошибка клиента');
                    break;
                case 401:
                    setErrorMessage(
                        error.response?.data?.detail || 'Требуется повторная авторизация',
                    );
                    break;
                case 403:
                    setErrorMessage(
                        error.response?.data?.detail || 'У вас нет прав на это действие',
                    );
                    break;
                default:
                    setErrorMessage(error.response?.data?.detail || 'Ошибка сервера');
            }
        } else {
            setErrorMessage('Не удалось обработать запрос');
        }
    }, []);

    const clearError = useCallback(() => {
        setErrorMessage(null);
    }, []);

    return { errorMessage, handleError, clearError };
};
