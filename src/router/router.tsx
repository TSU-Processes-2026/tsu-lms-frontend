import { LoginPage } from "../pages/Login";
import { RegisterPage } from "../pages/Register";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { LandingPage } from "../pages/Landing";
import ProtectedRoute from "../components/ProtectedRoute";
import { SubjectsPage } from "../pages/Subjects";
import { INITIAL_DATA } from "../constants/mocks/data.ts";
import { handleSelectSubject } from "../pages/Subjects/handlers";

export const router = createBrowserRouter([
    {
        // element: <ProgressLayout />,
        children: [
            {
                path: '/',
                element: <LandingPage />,
            },
            {
                path: '/login',
                element: <LoginPage />,
            },
            {
                path: '/register',
                element: <RegisterPage />,
            },
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        // element: <ClientLayout />,
                        children: [
                            // { path: '/home', element: <DashboardPage /> },
                            { path: '/subjects', element: <SubjectsPage subjects={ INITIAL_DATA.subjects } onSelectSubject={ handleSelectSubject } /> },
                            // { path: '/credits', element: <LoansPage /> },
                            // { path: '/operations', element: <OperationsPage /> },
                            // { path: '/support', element: <SupportPage /> },
                            { path: '/', element: <Navigate to='/home' replace /> },
                        ],
                    },
                ],
            },
            {
                path: '*',
                // element: <NotFoundPage />,
            },
        ],
    },
]);
