import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '@/pages/Login';
import { RegisterPage } from '@/pages/Register';
import { LandingPage } from '@/pages/Landing';
import ProtectedRoute from './ProtectedRoute';
import { ClientLayout } from '@/components/layout/ClientLayout';
import {
    HOME_PAGE_URL,
    LOGIN_PAGE_URL,
    REGISTER_PAGE_URL,
    ROOT_URL,
} from '@/constants/paths/paths';

export const router = createBrowserRouter([
    {
        path: ROOT_URL,
        element: <LandingPage />,
    },
    {
        path: LOGIN_PAGE_URL,
        element: <LoginPage />,
    },
    {
        path: REGISTER_PAGE_URL,
        element: <RegisterPage />,
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: HOME_PAGE_URL,
                element: <ClientLayout />,
                children: [
                    {
                        index: true,
                        element: <div>Главная страница</div>,
                    },
                    {
                        path: 'subjects',
                        element: <div>Страница с предметами</div>,
                    },
                    {
                        path: 'assignments',
                        element: <div>Страница с решениями</div>,
                    },
                ],
            },
        ],
    },
]);
