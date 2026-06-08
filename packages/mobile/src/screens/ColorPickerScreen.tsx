import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useAuthContext, VIBRANT_COLORS } from '@couple-calendar/shared';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const COLORS = Array.from(VIBRANT_COLORS);
const screenWidth = Dimensions.get('window').width;
const colorSize = (screenWidth - 60) / 3; // 3 colors per row with padding

export default function ColorPickerScreen({ navigation }: any) {
  const { user, loading: authLoading } = useAuthContext();
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!user) {
      setError('User not found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update user's color in Firestore
      const firebaseConfig = {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        color: selectedColor,
      });

      // Navigation will be handled automatically by auth state change
    } catch (err) {
      setError('Failed to save color. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Pick Your Color</Text>
          <Text style={styles.subtitle}>
            Choose a color that represents you in the calendar. Your partner will see events in your color.
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Color Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.colorGrid}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { width: colorSize, height: colorSize },
                  selectedColor === color && styles.selectedColor,
                ]}
                onPress={() => setSelectedColor(color)}
                disabled={loading}
              >
                <View
                  style={[
                    styles.colorBox,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorBox,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Selected Color Preview */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Your color:</Text>
            <View style={styles.previewContent}>
              <View
                style={[styles.previewBox, { backgroundColor: selectedColor }]}
              />
              <View>
                <Text style={styles.previewColor}>{selectedColor}</Text>
                <Text style={styles.previewHint}>
                  This is how your partner will see your calendar events
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info */}
        <Text style={styles.infoText}>
          You can change your color anytime in settings
        </Text>
      </ScrollView>

      {/* Continue Button (Fixed at bottom) */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, (loading || authLoading) && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={loading || authLoading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Continue to Dashboard</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 120, // Space for fixed button
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
    fontSize: 14,
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
  gridContainer: {
    marginBottom: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  colorButton: {
    padding: 8,
    marginBottom: 12,
  },
  colorBox: {
    flex: 1,
    borderRadius: 8,
  },
  selectedColor: {
    borderWidth: 4,
    borderColor: '#f1f5f9',
    transform: [{ scale: 1.05 }],
  },
  selectedColorBox: {
    borderRadius: 12,
  },
  previewContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  previewLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 12,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  previewBox: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  previewColor: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewHint: {
    color: '#64748b',
    fontSize: 12,
  },
  infoText: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  button: {
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
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
});
