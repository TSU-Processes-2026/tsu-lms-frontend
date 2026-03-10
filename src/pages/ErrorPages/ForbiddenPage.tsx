import { FORBIDDEN_ERROR } from '@/constants/response/errorMessages';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ForbiddenPage = () => {
    const navigate = useNavigate();
    return (
        <div className='max-w-6xl min-h-screen mx-auto space-y-8 box-border '>
            <section className='w-full h-full p-6'>
                <button
                    onClick={() => {
                        navigate(-1);
                    }}
                    className='flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium text-sm mb-6 transition-colors text-2xl'
                >
                    <ChevronLeft size={24} /> На предыдущую
                </button>
                <h1 className='text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-tight'>
                    <span className=' text-slate-900 bg-clip-text'>Доступ запрещен</span>
                </h1>
                <h2 className='px-4 text-2xl font-bold text-slate-600 mb-2'>{FORBIDDEN_ERROR}</h2>
            </section>
        </div>
    );
};
