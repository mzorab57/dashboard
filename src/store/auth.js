import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setUser: (user) => set({ user }),
      setTokens: ({ access, refresh }) => set({ accessToken: access, refreshToken: refresh || get().refreshToken }),
      login: ({ user, access_token, refresh_token }) => set({
        user,
        accessToken: access_token,
        refreshToken: refresh_token
      }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null })
    }),
    {
      name: 'auth',
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken }) // localStorage
    }
  )
);