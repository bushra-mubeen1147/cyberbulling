// Provide explicit type declarations for AuthProvider and useAuth.
import type { ReactNode } from 'react';

export interface AuthProviderProps { children: ReactNode }
export interface AuthContextValue {
  user: any;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<any>;
  signUpWithPassword: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
}

export declare function useAuth(): AuthContextValue;
export declare function AuthProvider(props: AuthProviderProps): JSX.Element;
