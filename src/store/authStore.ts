import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '@/types/auth';
import { APP_CONSTANTS } from '@/config';

interface AuthStore extends AuthState {
  login: (token: string, user: User, isAdmin?: boolean) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isAdmin: false,

      login: (token: string, user: User, isAdmin = false) => {
        set({
          isAuthenticated: true,
          token,
          user: { ...user, isAdmin },
          isAdmin,
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          token: null,
          user: null,
          isAdmin: false,
        });
      },

      updateUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: APP_CONSTANTS.AUTH_STORAGE_KEY,
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        isAdmin: state.isAdmin,
      }),
    }
  )
); 