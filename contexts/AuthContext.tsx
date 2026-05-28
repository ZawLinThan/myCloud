// contexts/AuthContext.tsx
'use client';

import { createContext, ReactNode, useContext, useEffect } from 'react';
import { auth } from '@/lib/firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { User } from 'firebase/auth';
import { refreshFirebaseSession, logout } from '@/lib/actions/user.actions';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | undefined;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      void logout();
      return;
    }

    void user.getIdToken().then((idToken) => {
      void refreshFirebaseSession({ idToken });
    });
  }, [loading, user]);

  return (
    <AuthContext.Provider value={{ user: user ?? null, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
