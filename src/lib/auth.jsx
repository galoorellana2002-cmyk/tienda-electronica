import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getSession, setSession } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(getSession);

  const save = useCallback((next) => {
    setSession(next);
    setSessionState(next);
  }, []);

  useEffect(() => {
    const expire = () => save(null);
    window.addEventListener('ca:session-expired', expire);
    return () => window.removeEventListener('ca:session-expired', expire);
  }, [save]);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      isAdmin: session?.user?.role === 'admin',
      async login(email, password) {
        const data = await api('/auth/login', { method: 'POST', body: { email, password } });
        save({ token: data.token, user: data.user });
        return data;
      },
      async register(name, email, password) {
        const data = await api('/auth/register', { method: 'POST', body: { name, email, password } });
        save({ token: data.token, user: data.user });
        return data;
      },
      logout() {
        save(null);
      },
    }),
    [session, save],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
