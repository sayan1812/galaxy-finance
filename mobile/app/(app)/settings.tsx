import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';
import { TYPOGRAPHY, SPACING, RADIUS, SCREEN_METRICS } from '../../constants/layout';
import { useResponsive } from '../../hooks/useResponsive';
import { useHaptics } from '../../hooks/useHaptics';
import { useAuth } from '../../store/AuthContext';
import { logOutFromFirebase } from '../../services/firebase';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { typography } = useResponsive();
  const { triggerLight, triggerHeavy } = useHaptics();
  const { user, logout, isBiometricActive, toggleBiometrics, isBiometricSupported } = useAuth();

  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  const handleLogout = async () => {
    triggerHeavy();
    Alert.alert(
      'Terminate Session',
      'Are you sure you want to exit your Galaxy Finance Command Center?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logOutFromFirebase();
              await logout();
              router.replace('/(auth)/login');
            } catch {
              router.replace('/(auth)/login');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 10, 20),
            paddingBottom: Math.max(insets.bottom + 80, 100),
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { fontSize: typography.heroSub }]}>
            SYSTEM & TELEMETRY
          </Text>
          <Text style={[styles.headerSub, { fontSize: typography.microMeta }]}>
            Configuration & Device Metrics
          </Text>
        </View>

        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name[0].toUpperCase() : 'C'}
            </Text>
          </View>
          <View style={styles.profileMeta}>
            <Text style={[styles.profileName, { fontSize: typography.cardHeader }]}>
              {user?.name || 'Commander Session'}
            </Text>
            <Text style={[styles.profileEmail, { fontSize: typography.microMeta }]}>
              {user?.email || 'commander@galaxyfinance.io'}
            </Text>
          </View>
        </View>

        {/* Device & FHD+ Viewport Diagnostics */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { fontSize: typography.cardHeader }]}>
            VIEWPORT & RESOLUTION DIAGNOSTICS
          </Text>

          <View style={styles.diagRow}>
            <Text style={styles.diagKey}>Target Mobile Display</Text>
            <Text style={styles.diagValue}>1080 × 2340 FHD+ (19.5:9)</Text>
          </View>
          <View style={styles.diagRow}>
            <Text style={styles.diagKey}>Logical Density Points</Text>
            <Text style={styles.diagValue}>
              {SCREEN_METRICS.width.toFixed(0)} × {SCREEN_METRICS.height.toFixed(0)} pt
            </Text>
          </View>
          <View style={styles.diagRow}>
            <Text style={styles.diagKey}>Device Pixel Ratio</Text>
            <Text style={styles.diagValue}>@{SCREEN_METRICS.pixelRatio.toFixed(2)}x (~400+ PPI)</Text>
          </View>
          <View style={styles.diagRow}>
            <Text style={styles.diagKey}>Top Inset (Notch / Punch-Hole)</Text>
            <Text style={styles.diagValue}>{insets.top} pt</Text>
          </View>
          <View style={styles.diagRow}>
            <Text style={styles.diagKey}>Bottom Inset (Gesture Bar)</Text>
            <Text style={styles.diagValue}>{insets.bottom} pt</Text>
          </View>
        </View>

        {/* Security & Preferences */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { fontSize: typography.cardHeader }]}>
            SECURITY & HARDWARE
          </Text>

          {isBiometricSupported && (
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Biometric Lock (Face ID / Touch)</Text>
                <Text style={styles.toggleSub}>Hardware-backed biometric authorization</Text>
              </View>
              <Switch
                value={isBiometricActive}
                onValueChange={(val) => {
                  triggerLight();
                  toggleBiometrics(val);
                }}
                trackColor={{ false: COLORS.borderSand, true: COLORS.primaryAccent }}
                thumbColor={COLORS.canvas}
              />
            </View>
          )}

          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleTitle}>Haptic Tactile Feedback</Text>
              <Text style={styles.toggleSub}>Tactile vibrations on tap and swipe</Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={(val) => {
                triggerLight();
                setHapticsEnabled(val);
              }}
              trackColor={{ false: COLORS.borderSand, true: COLORS.primaryAccent }}
              thumbColor={COLORS.canvas}
            />
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Text style={[styles.logoutText, { fontSize: typography.bodyRegular }]}>
            Terminate Session (Log Out)
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    color: COLORS.primaryText,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  headerSub: {
    color: COLORS.secondaryText,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  profileCard: {
    backgroundColor: COLORS.cardSurface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: SPACING.lg,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondaryAccent,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.primaryText,
    fontWeight: '900',
    fontSize: 20,
    fontFamily: 'monospace',
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    color: COLORS.primaryText,
    fontWeight: '800',
  },
  profileEmail: {
    color: COLORS.secondaryText,
    fontFamily: 'monospace',
  },
  sectionCard: {
    backgroundColor: COLORS.cardSurface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.primaryText,
    fontWeight: '800',
    fontFamily: 'monospace',
    marginBottom: SPACING.md,
  },
  diagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSand,
    minHeight: 44,
  },
  diagKey: {
    color: COLORS.secondaryText,
    fontSize: 12,
  },
  diagValue: {
    color: COLORS.primaryText,
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSand,
    minHeight: 48,
  },
  toggleTitle: {
    color: COLORS.primaryText,
    fontWeight: '600',
    fontSize: 13,
  },
  toggleSub: {
    color: COLORS.secondaryText,
    fontSize: 11,
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 177, 177, 0.35)',
    borderWidth: 1,
    borderColor: COLORS.errorUrgent,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: SPACING.md,
  },
  logoutText: {
    color: '#9C2525',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
