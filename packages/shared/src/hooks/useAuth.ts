'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  AuthError,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig, isValidConfig } from '../firebase/config';
import type { AuthUser } from '../types';

// Initialize Firebase (handles both web and mobile)
let auth: any = null;
let db: any = null;

const initializeFirebase = () => {
  if (!auth && isValidConfig()) {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
  return { auth, db };
};

/**
 * Custom hook for Firebase Authentication
 * Manages signup, login, logout, password reset
 * Creates user documents in Firestore on signup
 */
export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Firebase on first mount
  useEffect(() => {
    initializeFirebase();
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Sign up with email and password
   * Creates Firebase Auth user + Firestore user document
   */
  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      if (!auth || !db) {
        setError('Firebase not initialized');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        const firebaseUser = userCredential.user;

        // Create Firestore user document
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(userDocRef, {
          email: firebaseUser.email,
          displayName: displayName.trim(),
          color: null, // Will be set during color picker
          partnerId: null, // Will be set during pairing
          createdAt: serverTimestamp(),
          photoURL: null,
          fcmToken: null, // Will be set when notifications enabled
        });

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: displayName,
          photoURL: null,
        });
      } catch (err) {
        const firebaseErr = err as AuthError;
        setError(mapAuthError(firebaseErr.code));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!auth) {
        setError('Firebase not initialized');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        const firebaseUser = userCredential.user;
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } catch (err) {
        const firebaseErr = err as AuthError;
        setError(mapAuthError(firebaseErr.code));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Sign out current user
   */
  const signOutUser = useCallback(async () => {
    if (!auth) {
      setError('Firebase not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      const firebaseErr = err as AuthError;
      setError(mapAuthError(firebaseErr.code));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Send password reset email
   */
  const resetPassword = useCallback(
    async (email: string) => {
      if (!auth) {
        setError('Firebase not initialized');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await sendPasswordResetEmail(auth, email.trim());
      } catch (err) {
        const firebaseErr = err as AuthError;
        setError(mapAuthError(firebaseErr.code));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut: signOutUser,
    resetPassword,
    clearError,
  };
};

/**
 * Map Firebase Auth error codes to user-friendly messages
 */
function mapAuthError(code: string): string {
  const errorMap: Record<string, string> = {
    'auth/email-already-in-use': 'Email already registered',
    'auth/weak-password': 'Password too weak (minimum 6 characters)',
    'auth/invalid-email': 'Invalid email format',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/too-many-requests': 'Too many failed attempts. Try again later.',
    'auth/operation-not-allowed': 'Authentication is not enabled',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/network-request-failed': 'Network error. Please check your connection.',
  };

  return errorMap[code] || 'Authentication failed. Please try again.';
}
