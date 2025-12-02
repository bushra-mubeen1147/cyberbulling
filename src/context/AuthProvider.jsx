import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

/**
 * @typedef {Object} AuthContextValue
 * @property {any} user
 * @property {boolean} loading
 * @property {(email:string,password:string)=>Promise<any>} signInWithPassword
 * @property {(email:string,password:string)=>Promise<any>} signUpWithPassword
 * @property {()=>Promise<any>} signOut
 */

/** @type {import('react').Context<AuthContextValue|null>} */
const AuthContext = createContext(null);

/** @param {{children: import('react').ReactNode}} props */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!ignore) {
        setUser(data.session?.user || null);
        setLoading(false);
      }
    }
    init();
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      ignore = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });
  const signUpWithPassword = (email, password) =>
    supabase.auth.signUp({ email, password });
  const signOut = () => supabase.auth.signOut();

  /** @type {AuthContextValue} */
  const value = { user, loading, signInWithPassword, signUpWithPassword, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
