import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuthContext } from '@couple-calendar/shared';

export default function SignupScreen({ navigation }: any) {
  const { signUp, loading, error, clearError } = useAuthContext();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSignup = async () => {
    setLocalError(null);
    clearError();

    // Validate inputs
    if (!displayName || !email || !password || !confirmPassword) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (displayName.length < 1 || displayName.length > 50) {
      setLocalError('Name must be between 1 and 50 characters');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      await signUp(email, password, displayName);
      // User is now signed up, navigation will handle next step (color picker)
    } catch (err) {
      // Error is handled by useAuthContext
    }
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Couple Calendar</Text>
        </View>

        {/* Error Message */}
        {displayError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{displayError}</Text>
          </View>
        )}

        {/* Display Name Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={[styles.input, displayError && styles.inputError]}
            placeholder="John Doe"
            placeholderTextColor="#64748b"
            value={displayName}
            onChangeText={(text) => {
              setDisplayName(text);
              if (displayError) setLocalError(null);
            }}
            editable={!loading}
            maxLength={50}
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, displayError && styles.inputError]}
            placeholder="you@example.com"
            placeholderTextColor="#64748b"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (displayError) setLocalError(null);
            }}
            editable={!loading}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, displayError && styles.inputError]}
            placeholder="••••••••"
            placeholderTextColor="#64748b"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (displayError) setLocalError(null);
            }}
            editable={!loading}
            secureTextEntry
          />
          <Text style={styles.hint}>Minimum 6 characters</Text>
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={[styles.input, displayError && styles.inputError]}
            placeholder="••••••••"
            placeholderTextColor="#64748b"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (displayError) setLocalError(null);
            }}
            editable={!loading}
            secureTextEntry
          />
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        {/* Links */}
        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.linkTextBold}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#7f1d1d',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#cbd5e1',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    fontSize: 16,
    color: '#f1f5f9',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  hint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDisabled: {
    backgroundColor: '#475569',
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  linksContainer: {
    marginTop: 24,
  },
  linkText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },
  linkTextBold: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
});
