import { useEffect, useState } from 'react';

export const useDelayedLoader = (isLoading: boolean, delay: number = 5000) => {
    const [showLoader, setShowLoader] = useState<boolean>(false);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        if (isLoading) {
            timeout = setTimeout(() => setShowLoader(true), delay);
        } else {
            setShowLoader(false);
        }
        return () => {
            clearTimeout(timeout);
        };
    }, [isLoading, delay]);

    return { showLoader };
};
