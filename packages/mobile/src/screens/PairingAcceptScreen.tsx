import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useAuthContext, usePairing, formatPairingCode } from '@couple-calendar/shared';

export default function PairingAcceptScreen({ navigation, route }: any) {
  const { user } = useAuthContext();
  const { state, loading, error, validateCode, acceptInvite, clearError } = usePairing();
  const [inputCode, setInputCode] = useState('');
  const [validated, setValidated] = useState(false);
  const [validating, setValidating] = useState(false);

  // Check if code is in route params (from deep link)
  useEffect(() => {
    const urlCode = route?.params?.code;
    if (urlCode && !inputCode) {
      setInputCode(urlCode);
      handleValidate(urlCode);
    }
  }, [route?.params?.code]);

  const handleValidate = async (code: string) => {
    setValidating(true);
    try {
      await validateCode(code);
      setValidated(true);
    } catch (err) {
      setValidated(false);
    } finally {
      setValidating(false);
    }
  };

  const handleAccept = async () => {
    try {
      await acceptInvite(inputCode);
      // Navigation to dashboard will be handled automatically by auth state change
      navigation.goBack();
    } catch (err) {
      // Error will be shown in error message
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
          <Text style={styles.title}>Join Your Partner</Text>
          <Text style={styles.subtitle}>
            Enter the invite code they shared with you
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

        <View style={styles.contentContainer}>
          {/* Code Input Section */}
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Enter 9-character code:</Text>

            <TextInput
              value={formatPairingCode(inputCode)}
              onChangeText={(text) => {
                setInputCode(text.toUpperCase());
                setValidated(false);
              }}
              placeholder="ABC-DEF-GHI"
              maxLength={11}
              placeholderTextColor="#64748b"
              style={styles.codeInput}
            />

            {validated && state.expiresAt && (
              <View style={styles.validationMessage}>
                <Text style={styles.validationText}>✓ Code is valid</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => handleValidate(formatPairingCode(inputCode))}
              disabled={validating || loading || inputCode.length < 9}
              style={[
                styles.validateButton,
                (validating || loading || inputCode.length < 9) && styles.validateButtonDisabled,
              ]}
            >
              {validating ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.validateButtonText}>Validate Code</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Partner Preview */}
          {validated && state.generatorName && (
            <View style={styles.partnerCard}>
              <Text style={styles.partnerLabel}>Confirm pair with:</Text>

              <View style={styles.partnerInfo}>
                <View
                  style={[
                    styles.partnerColorBox,
                    { backgroundColor: state.generatorColor || '#000000' },
                  ]}
                />
                <View style={styles.partnerDetails}>
                  <Text style={styles.partnerName}>{state.generatorName}</Text>
                  <Text style={styles.partnerColor}>{state.generatorColor}</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleAccept}
                disabled={loading}
                style={[
                  styles.confirmButton,
                  loading && styles.confirmButtonDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm & Pair</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleBackToDashboard}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
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
  codeInput: {
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
    marginBottom: 16,
  },
  validationMessage: {
    backgroundColor: '#064e3b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  validationText: {
    color: '#6ee7b7',
    fontSize: 14,
    fontWeight: '600',
  },
  validateButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  validateButtonDisabled: {
    backgroundColor: '#475569',
    opacity: 0.6,
  },
  validateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  partnerCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  partnerLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 16,
    fontWeight: '500',
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  partnerColorBox: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  partnerDetails: {
    flex: 1,
  },
  partnerName: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  partnerColor: {
    color: '#94a3b8',
    fontSize: 12,
  },
  confirmButton: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  confirmButtonDisabled: {
    backgroundColor: '#475569',
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
