'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import type { Couple, User, CoupleContextType } from '../types';

const CoupleContext = createContext<CoupleContextType | undefined>(undefined);

export const CoupleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();
  const [couple, setCouple] = useState<Couple | null>(null);
  const [myUser, setMyUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [db, setDb] = useState<any>(null);

  useEffect(() => {
    try {
      const database = getFirestore();
      setDb(database);
    } catch (err: any) {
      setError('Failed to initialize Firestore');
      setLoading(false);
    }
  }, []);

  // Listen to current user's data
  useEffect(() => {
    if (!authUser?.uid || !db) {
      setMyUser(null);
      setCouple(null);
      setPartner(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const userRef = doc(db, 'users', authUser.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data();
          setMyUser({
            id: snapshot.id,
            email: userData.email,
            displayName: userData.displayName,
            color: userData.color,
            partnerId: userData.partnerId,
            createdAt: userData.createdAt?.toDate?.() || new Date(),
            photoURL: userData.photoURL,
          } as User);

          // If user has a partner, fetch couple data
          if (userData.partnerId) {
            fetchCoupleAndPartner(authUser.uid, userData.partnerId);
          } else {
            setCouple(null);
            setPartner(null);
            setLoading(false);
          }
        } else {
          setMyUser(null);
          setLoading(false);
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authUser?.uid, db, authUser]);

  const fetchCoupleAndPartner = (myId: string, partnerId: string) => {
    try {
      // Create couple ID (lexicographically sorted)
      const coupleId = [myId, partnerId].sort().join('_');

      // Fetch couple document
      const coupleRef = doc(db, 'couples', coupleId);
      const coupleUnsubscribe = onSnapshot(coupleRef, (snapshot) => {
        if (snapshot.exists()) {
          const coupleData = snapshot.data();
          setCouple({
            id: snapshot.id,
            partner1Id: coupleData.partner1Id,
            partner2Id: coupleData.partner2Id,
            pairedAt: coupleData.pairedAt?.toDate?.() || new Date(),
            settings: coupleData.settings,
          } as Couple);
        } else {
          setCouple(null);
        }
      });

      // Fetch partner document
      const partnerRef = doc(db, 'users', partnerId);
      const partnerUnsubscribe = onSnapshot(partnerRef, (snapshot) => {
        if (snapshot.exists()) {
          const partnerData = snapshot.data();
          setPartner({
            id: snapshot.id,
            email: partnerData.email,
            displayName: partnerData.displayName,
            color: partnerData.color,
            partnerId: partnerData.partnerId,
            createdAt: partnerData.createdAt?.toDate?.() || new Date(),
            photoURL: partnerData.photoURL,
          } as User);
        }
        setLoading(false);
      });

      return () => {
        coupleUnsubscribe();
        partnerUnsubscribe();
      };
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return () => {};
    }
  };

  const value: CoupleContextType = {
    couple,
    partner,
    myUser,
    loading,
    error,
    myColor: myUser?.color || '#3B82F6',
    coupleId: couple?.id || null,
  };

  return <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>;
};

export const useCoupleContext = (): CoupleContextType => {
  const context = useContext(CoupleContext);
  if (!context) {
    throw new Error('useCoupleContext must be used within CoupleProvider');
  }
  return context;
};
