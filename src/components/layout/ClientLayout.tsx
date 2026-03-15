import { BookOpen, ClipboardCheck, Key, Layout, LogOut, Plus, UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useLogout } from '@/hooks/logout/useLogout';
import { CreateSubjectModal } from '../modals/SubjectModal';
import { useProfile } from '@/hooks/profile/useProfile';
import { JoinSubjectModal } from '../modals/JoinSubjectModal';

const navItems = [
    { id: '/subjects', label: 'Предметы', icon: <BookOpen size={20} /> },
    {
        id: 'assignments',
        label: 'Задания',
        icon: <ClipboardCheck size={20} />,
    },
];

export const ClientLayout = () => {
    const [currentView, setView] = useState<string | null>('/home');
    const [pageTitle, setPageTitle] = useState<string>('Главная');
    const [showSubjectModal, setShowSubjectModal] = useState<boolean>(false);
    const [showJoinSubject, setShowJoinSubject] = useState<boolean>();
    const { logout } = useLogout();
    const { profile, getCurrentUser } = useProfile();
    const navigate = useNavigate();

    useEffect(() => {
        getCurrentUser();
    }, []);

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex text-slate-800 font-sans'>
            <aside className='w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 hidden md:flex flex-col shadow-sm'>
                <div
                    className='p-6 flex items-center gap-3 border-b border-slate-100 cursor-pointer'
                    onClick={() => {
                        setView('/home');
                        navigate('/home');
                        setPageTitle('Главная');
                    }}
                >
                    <div className='w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50'>
                        <BookOpen className='text-white w-5 h-5' />
                    </div>
                    <span className='font-bold text-xl bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent'>
                        StudyHub
                    </span>
                </div>
                <nav className='flex-1 p-4 space-y-1'>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setView(item.id);
                                navigate(item.id);
                                setPageTitle(item.label);
                            }}
                            className={`w-full flex items-center cursor-pointer gap-3 px-4 py-3 rounded-xl transition-all ${currentView === item.id ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200/50' : 'hover:bg-slate-50 text-slate-600'}`}
                        >
                            {item.icon}
                            <span className='font-medium'>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className='p-4 border-t border-slate-100 space-y-3'>
                    <button
                        onClick={() => setShowJoinSubject(true)}
                        className='w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-200/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2'
                    >
                        <Key size={18} /> Присоединиться
                    </button>

                    <button
                        onClick={() => {
                            setShowSubjectModal(true);
                        }}
                        className='w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-200/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2'
                    >
                        <Plus size={18} /> Создать предмет
                    </button>
                    <button
                        onClick={logout}
                        className='w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium'
                    >
                        <LogOut size={20} /> Выход
                    </button>
                </div>
            </aside>

            <main className='flex-1 flex flex-col h-screen overflow-hidden'>
                <header className='h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 flex items-center justify-between shadow-sm shrink-0'>
                    <div>
                        <h2 className='text-xl font-bold text-slate-800'>{pageTitle}</h2>
                    </div>
                    <div className='flex items-center gap-4'>
                        <div className='flex items-center gap-3 pl-4 border-l border-slate-200'>
                            <div className='text-right hidden sm:block'>
                                <p className='text-sm font-semibold leading-none text-slate-700'>
                                    {profile.username}
                                </p>
                            </div>
                            <div className='w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50'>
                                <UserIcon size={20} className='text-white' />
                            </div>
                        </div>
                    </div>
                </header>

                <div className='flex-1 overflow-y-auto p-6'>
                    <Outlet />
                </div>
            </main>
            {showSubjectModal && (
                <CreateSubjectModal
                    onClose={() => {
                        setShowSubjectModal(false);
                    }}
                    onCreate={() => {}}
                />
            )}
            {showJoinSubject && (
                <JoinSubjectModal
                    onClose={() => {
                        setShowJoinSubject(false);
                    }}
                />
            )}
        </div>
    );
};
