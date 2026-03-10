import { getProfile } from '@/api/profile/profile';
import { INTERNAL_SERVER_ERROR_PAGE_URL, LOGIN_PAGE_URL } from '@/constants/paths/paths';
import { UserResponse } from '@/types/user/UserResponse';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useProfile = () => {
    const [profile, setProfile] = useState<UserResponse>({
        id: '',
        username: '',
    });

    const navigate = useNavigate();

    const getCurrentUser = async () => {
        try {
            const response = await getProfile();
            setProfile((prev) => ({
                ...prev,
                id: response.data.id,
                username: response.data.username,
            }));
        } catch (error) {
            if (isAxiosError(error)) {
                if (error.response?.status === 401) {
                    navigate(LOGIN_PAGE_URL);
                }
                if (error.response?.status === 500) {
                    navigate(INTERNAL_SERVER_ERROR_PAGE_URL);
                }
            } else {
                return;
            }
        }
    };

    return { profile, setProfile, getCurrentUser };
};
