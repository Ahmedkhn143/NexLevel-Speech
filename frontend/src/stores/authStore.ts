import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { User } from '@/types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setTokens: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,

            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: !!user,
                    isLoading: false,
                }),

            setTokens: (accessToken, refreshToken) => {
                Cookies.set('accessToken', accessToken, { expires: 1 });
                Cookies.set('refreshToken', refreshToken, { expires: 7 });
            },

            logout: () => {
                Cookies.remove('accessToken');
                Cookies.remove('refreshToken');
                set({ user: null, isAuthenticated: false });
            },

            setLoading: (loading) => set({ isLoading: loading }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
            onRehydrateStorage: () => (state) => {
                state?.setLoading(false);
            },
        }
    )
);
