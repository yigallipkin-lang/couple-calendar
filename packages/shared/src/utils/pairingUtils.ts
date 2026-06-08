/**
 * Pairing utilities for invite code handling and formatting
 */

/**
 * Format pairing code for display (ABC-DEF-GHI)
 */
export const formatPairingCode = (code: string): string => {
  const cleaned = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return [
    cleaned.substring(0, 3),
    cleaned.substring(3, 6),
    cleaned.substring(6, 9),
  ]
    .filter(part => part.length > 0)
    .join('-');
};

/**
 * Validate pairing code format (9 alphanumeric chars)
 */
export const isValidPairingCode = (code: string): boolean => {
  const formatted = formatPairingCode(code);
  return /^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{3}$/.test(formatted);
};

/**
 * Parse pairing code from URL (e.g., ?code=ABC-DEF-GHI)
 */
export const getPairingCodeFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('code');
};

/**
 * Create shareable pairing URL
 */
export const createPairingUrl = (
  code: string,
  baseUrl: string = 'https://couple-calendar.app'
): string => {
  return `${baseUrl}/pairing/accept?code=${code}`;
};

/**
 * Calculate time remaining for code expiry
 */
export const getTimeRemaining = (
  expiresAt: Date
): {
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
} => {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, expired: false };
};

/**
 * Format time remaining for display
 */
export const formatTimeRemaining = (expiresAt: Date): string => {
  const { hours, minutes, seconds, expired } = getTimeRemaining(expiresAt);

  if (expired) return 'Expired';
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

/**
 * Generate couple ID from two user IDs (lexicographically sorted)
 */
export const generateCoupleId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('_');
};
