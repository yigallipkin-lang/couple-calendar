import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useAuthContext } from '@couple-calendar/shared';

export default function DashboardScreen({ navigation }: any) {
  const { user, signOut } = useAuthContext();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleGenerateInvite = () => {
    navigation.navigate('PairingGenerate');
  };

  const handleAcceptInvite = () => {
    navigation.navigate('PairingAccept');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Couple Calendar</Text>
          <Text style={styles.welcomeText}>
            Welcome, {user?.displayName || user?.email}!
          </Text>
        </View>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!user?.partnerId ? (
          // Not paired yet - show pairing options
          <View style={styles.pairingContainer}>
            <View style={styles.pairingCard}>
              <Text style={styles.pairingTitle}>Ready to pair? 💑</Text>
              <Text style={styles.pairingDescription}>
                Connect with your partner to start sharing calendar events and todo lists.
              </Text>

              <View style={styles.pairingButtonContainer}>
                <TouchableOpacity
                  style={[styles.pairingButton, styles.pairingButtonPrimary]}
                  onPress={handleGenerateInvite}
                >
                  <Text style={styles.pairingButtonText}>Generate Invite</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pairingButton, styles.pairingButtonSecondary]}
                  onPress={handleAcceptInvite}
                >
                  <Text style={styles.pairingButtonSecondaryText}>Enter Code</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Feature Cards */}
            <View style={styles.featuresGrid}>
              <View style={styles.featureCard}>
                <Text style={styles.featureEmoji}>📅</Text>
                <Text style={styles.featureTitle}>Calendar</Text>
                <Text style={styles.featureDescription}>
                  View and manage events together
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureEmoji}>✓</Text>
                <Text style={styles.featureTitle}>Todo Lists</Text>
                <Text style={styles.featureDescription}>
                  Collaborate on tasks and checklists
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureEmoji}>🔔</Text>
                <Text style={styles.featureTitle}>Notifications</Text>
                <Text style={styles.featureDescription}>
                  Stay updated on partner activities
                </Text>
              </View>
            </View>
          </View>
        ) : (
          // Already paired - show partner info and calendar placeholder
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Welcome to Couple Calendar! 🎉</Text>
            <Text style={styles.welcomeDescription}>
              You're all set! Calendar and todo features are coming soon.
            </Text>

            {/* Feature Cards */}
            <View style={styles.featuresGrid}>
              <View style={styles.featureCard}>
                <Text style={styles.featureEmoji}>📅</Text>
                <Text style={styles.featureTitle}>Calendar</Text>
                <Text style={styles.featureDescription}>
                  View and manage events together
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureEmoji}>✓</Text>
                <Text style={styles.featureTitle}>Todo Lists</Text>
                <Text style={styles.featureDescription}>
                  Collaborate on tasks and checklists
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureEmoji}>🔔</Text>
                <Text style={styles.featureTitle}>Notifications</Text>
                <Text style={styles.featureDescription}>
                  Stay updated on partner activities
                </Text>
              </View>
            </View>

            {/* Next Steps */}
            <View style={styles.nextStepsCard}>
              <Text style={styles.nextStepsText}>
                Coming soon: Calendar events and todo lists!
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  welcomeText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  signOutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#334155',
    borderRadius: 6,
  },
  signOutButtonText: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  pairingContainer: {
    gap: 20,
  },
  pairingCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  pairingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 8,
    textAlign: 'center',
  },
  pairingDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 20,
    textAlign: 'center',
  },
  pairingButtonContainer: {
    gap: 12,
  },
  pairingButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  pairingButtonPrimary: {
    backgroundColor: '#0ea5e9',
  },
  pairingButtonSecondary: {
    backgroundColor: '#334155',
  },
  pairingButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  pairingButtonSecondaryText: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '600',
  },
  welcomeCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresGrid: {
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  featureEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  nextStepsCard: {
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  nextStepsText: {
    fontSize: 14,
    color: '#7dd3fc',
    textAlign: 'center',
  },
});
