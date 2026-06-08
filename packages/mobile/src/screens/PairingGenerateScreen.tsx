import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Share,
  Clipboard,
  TextInput,
} from 'react-native';
import { useAuthContext, usePairing, formatPairingCode, formatTimeRemaining } from '@couple-calendar/shared';

export default function PairingGenerateScreen({ navigation }: any) {
  const { user } = useAuthContext();
  const { state, loading, error, generateInvite, clearError } = usePairing();
  const [copied, setCopied] = useState(false);

  // Generate code on mount
  useEffect(() => {
    if (!state.code && !loading) {
      generateInvite().catch(() => {
        // Error is handled by usePairing
      });
    }
  }, []);

  const handleCopyCode = async () => {
    if (state.code) {
      await Clipboard.setString(formatPairingCode(state.code));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    if (state.code) {
      const shareUrl = `https://couple-calendar.app/pairing/accept?code=${state.code}`;
      await Clipboard.setString(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!state.code) return;
    const shareUrl = `https://couple-calendar.app/pairing/accept?code=${state.code}`;
    try {
      await Share.share({
        message: `Join me on Couple Calendar!\n\nShare code: ${formatPairingCode(state.code)}\n\nOr use this link: ${shareUrl}`,
        title: 'Join Couple Calendar',
        url: shareUrl,
      });
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleBackToDashboard = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBackToDashboard}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Share Your Invite</Text>
          <Text style={styles.subtitle}>
            Send this code to your partner so they can join you
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={clearError}
              style={styles.dismissButton}
            >
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading State */}
        {loading && !state.code ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0ea5e9" />
            <Text style={styles.loadingText}>Generating invite...</Text>
          </View>
        ) : state.code ? (
          <View style={styles.contentContainer}>
            {/* Code Card */}
            <View style={styles.codeCard}>
              <Text style={styles.codeLabel}>
                Your invite code (valid{' '}
                {state.expiresAt ? formatTimeRemaining(state.expiresAt) : '...'}):
              </Text>

              {/* Code Display */}
              <View style={styles.codeDisplay}>
                <TextInput
                  value={formatPairingCode(state.code)}
                  editable={false}
                  style={styles.codeInput}
                  selectTextOnFocus
                />
                <TouchableOpacity
                  onPress={handleCopyCode}
                  style={styles.copyButton}
                >
                  <Text style={styles.copyButtonText}>
                    {copied ? '✓ Copied' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Share URL */}
              <View style={styles.shareUrlContainer}>
                <Text style={styles.shareUrlLabel}>Or share this link:</Text>
                <TextInput
                  value={`https://couple-calendar.app/pairing/accept?code=${state.code}`}
                  editable={false}
                  style={styles.shareUrlInput}
                  numberOfLines={2}
                />
              </View>

              {/* Share Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={handleCopyLink}
                  style={[styles.button, styles.buttonSecondary]}
                >
                  <Text style={styles.buttonTextSecondary}>
                    {copied ? '✓ Link Copied' : 'Copy Link'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleShare}
                  style={[styles.button, styles.buttonSecondary]}
                >
                  <Text style={styles.buttonTextSecondary}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Waiting Message */}
            <View style={styles.waitingContainer}>
              <Text style={styles.waitingText}>🔄 Waiting for your partner to join...</Text>
              <Text style={styles.waitingHint}>
                This page will update automatically when they accept
              </Text>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleBackToDashboard}
            >
              <Text style={styles.cancelButtonText}>Cancel & Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  backButtonText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  errorContainer: {
    backgroundColor: '#7f1d1d',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    marginBottom: 8,
  },
  dismissButton: {
    marginTop: 8,
  },
  dismissText: {
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 16,
  },
  contentContainer: {
    gap: 24,
  },
  codeCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  codeLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 16,
    fontWeight: '500',
  },
  codeDisplay: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  codeInput: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  copyButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  copyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  shareUrlContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  shareUrlLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8,
  },
  shareUrlInput: {
    color: '#f1f5f9',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonSecondary: {
    backgroundColor: '#334155',
  },
  buttonTextSecondary: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '600',
  },
  waitingContainer: {
    backgroundColor: '#0c4a6e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  waitingText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  waitingHint: {
    color: '#7dd3fc',
    fontSize: 12,
  },
  cancelButton: {
    backgroundColor: '#334155',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelButtonText: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '600',
  },
});
