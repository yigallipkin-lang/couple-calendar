'use client';

import { useCallback, useState } from 'react';
import { httpsCallable, getFunctions } from 'firebase/functions';
import type { ApiResponse, PairingResponse } from '../types';

export interface PairingState {
  code: string | null;
  generatorId: string | null;
  generatorName: string | null;
  generatorColor: string | null;
  expiresAt: Date | null;
  isExpired: boolean;
  isUsed: boolean;
  coupleId: string | null;
}

export const usePairing = () => {
  const [state, setState] = useState<PairingState>({
    code: null,
    generatorId: null,
    generatorName: null,
    generatorColor: null,
    expiresAt: null,
    isExpired: false,
    isUsed: false,
    coupleId: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const functions = getFunctions();

  /**
   * Generate a pairing invite code
   */
  const generateInvite = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const generatePairingInvite = httpsCallable(functions, 'generatePairingInvite');

      const result = await generatePairingInvite({});
      const response = result.data as ApiResponse<{
        code: string;
        expiresAt: Date;
        shareUrl: string;
      }>;

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to generate invite');
      }

      setState(prev => ({
        ...prev,
        code: response.data?.code || null,
        expiresAt: response.data?.expiresAt ? new Date(response.data.expiresAt) : null,
      }));

      return response.data.code;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to generate invite';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [functions]);

  /**
   * Validate a pairing code before accepting
   */
  const validateCode = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      const validatePairingCode = httpsCallable(functions, 'validatePairingCode');

      const result = await validatePairingCode({ code });
      const response = result.data as ApiResponse<{
        generatorId: string;
        generatorName: string;
        generatorColor: string;
        expiresAt: Date;
        isExpired: boolean;
        isUsed: boolean;
      }>;

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Invalid code');
      }

      setState(prev => ({
        ...prev,
        code,
        generatorId: response.data?.generatorId || null,
        generatorName: response.data?.generatorName || null,
        generatorColor: response.data?.generatorColor || null,
        expiresAt: response.data?.expiresAt ? new Date(response.data.expiresAt) : null,
        isExpired: response.data?.isExpired || false,
        isUsed: response.data?.isUsed || false,
      }));

      return response.data;
    } catch (err: any) {
      const errorMsg = err.message || 'Invalid or expired code';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [functions]);

  /**
   * Accept a pairing invite and create couple
   */
  const acceptInvite = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      const acceptPairingInvite = httpsCallable(functions, 'acceptPairingInvite');

      const result = await acceptPairingInvite({ code });
      const response = result.data as ApiResponse<PairingResponse>;

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to accept invite');
      }

      setState(prev => ({
        ...prev,
        coupleId: response.data?.coupleId || null,
      }));

      return response.data;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to pair';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [functions]);

  const clearError = useCallback(() => setError(null), []);
  const resetState = useCallback(() => {
    setState({
      code: null,
      generatorId: null,
      generatorName: null,
      generatorColor: null,
      expiresAt: null,
      isExpired: false,
      isUsed: false,
      coupleId: null,
    });
  }, []);

  return {
    state,
    loading,
    error,
    generateInvite,
    validateCode,
    acceptInvite,
    clearError,
    resetState,
  };
};
