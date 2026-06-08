'use client'; // For Next.js compatibility

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { AuthContextType } from '../types';

/**
 * React Context for authentication state
 * Provides user, loading, error, and auth methods to entire app
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component
 * Wraps the app and provides auth state to all children
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access auth context
 * Use this in any component that needs auth state
 *
 * @example
 * const { user, signIn, signUp } = useAuthContext()
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
