import React, { ReactNode, createContext, useContext, useState } from 'react';
import LoadingDialog from './LoadingDialog';

const LoadingContext = createContext({
    showLoading: () => { },
    hideLoading: () => { },
});

export const useLoading = () => useContext(LoadingContext);

interface LoadingProviderProps {
    children: ReactNode;
}
export const LoadingProvider = ({ children }: LoadingProviderProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const showLoading = () => setIsLoading(true);
    const hideLoading = () => setIsLoading(false);

    return (
        <LoadingContext.Provider value={{ showLoading, hideLoading }}>
            {children}
            {isLoading && <LoadingDialog />}
        </LoadingContext.Provider>
    );
};
