export const HomePage = () => {
    return (
        <div className='max-w-7xl h-auto mx-auto space-y-8 box-border'>
            <h1 className='text-4xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight'>
                <span className=' text-slate-900 bg-clip-text'>
                    Добро пожаловать на{' '}
                    <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                        StudyHub
                    </span>{' '}
                </span>
            </h1>
            <h2 className=' text-2xl font-medium text-slate-600 mb-2'>
                <span className=' text-slate-700 bg-clip-text'>
                    Выберите нужную страницу на панели слева
                </span>
            </h2>
        </div>
    );
};
