import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '@/pages/Login';
import { RegisterPage } from '@/pages/Register';
import { LandingPage } from '@/pages/Landing';
import ProtectedRoute from './ProtectedRoute';
import { ClientLayout } from '@/components/layout/ClientLayout';
import {
    FORBIDDEN_PAGE,
    HOME_PAGE_URL,
    INTERNAL_SERVER_ERROR_PAGE_URL,
    LOGIN_PAGE_URL,
    REGISTER_PAGE_URL,
    ROOT_URL,
} from '@/constants/paths/paths';
import { SubjectsPage } from '@/pages/Subjects';
import { ServerErrorPage } from '@/pages/ErrorPages/ServerErrorPage.tsx';
import { NotFoundPage } from '@/pages/ErrorPages/NotFoundPage.tsx';
import { ForbiddenPage } from '@/pages/ErrorPages/ForbiddenPage.tsx';
import { HomePage } from "@/pages/HomePage";

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
                element: <ClientLayout />,
                children: [
                    {
                        path: HOME_PAGE_URL,
                        element: <HomePage />,
                    },
                    {
                        path: '/subjects',
                        element: <SubjectsPage />,
                    },
                    {
                        path: '/assignments',
                        element: <div>Страница с решениями</div>,
                    },
                ],
            },
        ],
    },
    {
        path: FORBIDDEN_PAGE,
        element: <ForbiddenPage />,
    },
    {
        path: INTERNAL_SERVER_ERROR_PAGE_URL,
        element: <ServerErrorPage />,
    },
    { path: '*', element: <NotFoundPage /> },
]);
