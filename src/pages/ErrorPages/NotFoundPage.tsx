import {
    NOT_FOUND_PAGE,
    NOT_FOUND_PREFIX,
    NOT_FOUND_SUFFIX,
} from '@/constants/error/errorMessages';
import { HOME_PAGE_URL } from '@/constants/paths/paths';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
    const navigate = useNavigate();
    return (
        <div className='max-w-6xl min-h-screen mx-auto space-y-8 box-border '>
            <section className='w-full h-full p-6'>
                <button
                    onClick={() => {
                        navigate(HOME_PAGE_URL);
                    }}
                    className='flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium text-sm mb-6 transition-colors text-2xl'
                >
                    <ChevronLeft size={24} /> На главную
                </button>
                <h1 className='text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-tight'>
                    <span className=' text-slate-900 bg-clip-text'>Страница не найдена</span>
                </h1>
                <h2 className='px-4 text-2xl font-bold text-slate-600 mb-2'>
                    {NOT_FOUND_PREFIX + window.location.pathname + NOT_FOUND_SUFFIX}
                    <br />
                    {NOT_FOUND_PAGE}
                </h2>
            </section>
        </div>
    );
};
