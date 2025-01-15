import React, { createContext, useContext } from 'react';
import { supabase } from './supabaseClient';

const SupabaseContext = createContext(supabase);

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <SupabaseContext.Provider value={supabase}>
            {children}
        </SupabaseContext.Provider>
    );
};

export const useSupabase = () => {
    return useContext(SupabaseContext);
}; 