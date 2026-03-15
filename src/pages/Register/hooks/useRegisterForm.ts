import { useState } from 'react';
import {
    CONFIRM_PASSWORD_EMPTY_ERROR_MESSAGE,
    CONFIRM_PASSWORD_FAILED_ERROR_MESSAGE,
    LOGIN_EMPTY_ERROR_MESSAGE,
    LOGIN_LENGTH_ERROR_MESSAGE,
    PASSWORD_EMPTY_ERROR_MESSAGE,
    PASSWORD_LENGTH_ERROR_MESSAGE,
} from '../../../constants/error/errorMessages';
import { register } from '../../../api/register/register';
import { AxiosResponse, isAxiosError } from 'axios';
import { login } from '../../../api/authorization/login';
import { TokenResponse } from '../../../types/token/TokenResponse';
import { HOME_PAGE_URL } from '../../../constants/paths/paths';
import { useNavigate } from 'react-router-dom';

export const useRegisterForm = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setErrorMessage('');

        if (!validateForm()) {
            return;
        }
        try {
            await register({
                username: username,
                password: password,
            });
            const response: AxiosResponse<TokenResponse> = await login({
                username: username,
                password: password,
            });
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('userId', response.data.userId);
            localStorage.setItem('sessionId', response.data.sessionId);
            navigate(HOME_PAGE_URL);
        } catch (error) {
            console.log(error);
            if (isAxiosError(error)) {
                if (error.response?.status === 400)
                    setErrorMessage(error.response?.data.message || 'Неверные данные');
                if (error.response?.status === 409)
                    setErrorMessage(error.response.data.message || 'Указаный логин уже занят');
                if (error.response?.status === 500)
                    setErrorMessage(error.response?.data.message || 'Ошибка сервеа');
            } else {
                setErrorMessage('Не удалось обработать запрос');
            }
        } finally {
            return;
        }
    };

    const validateForm = (): boolean => {
        if (validateLogin() && validatePassword() && validateConfirmPassword()) return true;
        return false;
    };

    const validateLogin = (): boolean => {
        if (username === null || username === undefined || username.trim() === '') {
            setErrorMessage(LOGIN_EMPTY_ERROR_MESSAGE);
            return false;
        }
        if (username.trim().length < 3 || username.trim().length > 50) {
            setErrorMessage(LOGIN_LENGTH_ERROR_MESSAGE);
            return false;
        }
        return true;
    };

    const validatePassword = (): boolean => {
        if (password === null || password === undefined || password.trim() === '') {
            setErrorMessage(PASSWORD_EMPTY_ERROR_MESSAGE);
            return false;
        }
        if (password.trim().length < 6 || password.trim().length > 20) {
            setErrorMessage(PASSWORD_LENGTH_ERROR_MESSAGE);
            return false;
        }
        return true;
    };

    const validateConfirmPassword = (): boolean => {
        if (
            confirmPassword === null ||
            confirmPassword === undefined ||
            confirmPassword.trim() === ''
        ) {
            setErrorMessage(CONFIRM_PASSWORD_EMPTY_ERROR_MESSAGE);
            return false;
        }
        if (password.trim() !== confirmPassword.trim()) {
            setErrorMessage(CONFIRM_PASSWORD_FAILED_ERROR_MESSAGE);
            return false;
        }
        return true;
    };

    return {
        username,
        password,
        confirmPassword,
        errorMessage,
        setUsername,
        setPassword,
        setConfirmPassword,
        setErrorMessage,
        onSubmit,
        validateForm,
    };
};
