declare module '../context/AuthProvider' {
  import type { ReactNode } from 'react';
  export interface AuthContextValue {
    user: any;
    loading: boolean;
    signInWithPassword: (email: string, password: string) => Promise<any>;
    signUpWithPassword: (email: string, password: string) => Promise<any>;
    signOut: () => Promise<any>;
  }
  export function AuthProvider(props: { children: ReactNode }): JSX.Element;
  export function useAuth(): AuthContextValue | null;
}
