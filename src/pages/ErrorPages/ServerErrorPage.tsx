import { INTERNAL_SERVER_ERROR_MESSAGE } from '@/constants/error/errorMessages';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ServerErrorPage = () => {
    const navigate = useNavigate();
    return (
        <div className='max-w-6xl min-h-screen mx-auto space-y-8 box-border '>
            <section className='w-full h-full py-6'>
                <button
                    onClick={() => {
                        navigate(-1);
                    }}
                    className='flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium text-sm mb-6 transition-colors text-2xl'
                >
                    <ChevronLeft size={24} /> На предыдущую
                </button>
                <h1 className='text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-tight'>
                    <span className=' text-slate-900 bg-clip-text'>Ошибка сервера</span>
                </h1>
                <h2 className='px-4 text-2xl font-bold text-slate-600 mb-2'>
                    {INTERNAL_SERVER_ERROR_MESSAGE}
                </h2>
            </section>
        </div>
    );
};
