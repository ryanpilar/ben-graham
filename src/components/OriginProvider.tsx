"use client";

import { log } from 'console';
import { usePathname } from 'next/navigation';
import { useState, createContext, useEffect, useRef } from 'react';

export const OriginContext = createContext<boolean>(false);

export default function OriginTrackerProvider({ children }: React.PropsWithChildren) {
    const pathname = usePathname()
    
    const [isWithinPage, setIsWithinPage] = useState(false);
    const isInitialLoadRef = useRef(true);

    useEffect(() => {
        if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
            return;
        }

        setIsWithinPage(true);
        return () => setIsWithinPage(false);
    }, [pathname]);

    return (
        <OriginContext.Provider value={isWithinPage}>
            {children}
        </OriginContext.Provider>
    );
}