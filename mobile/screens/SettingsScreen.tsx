import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';
import { useFinance } from '../store/FinanceContext';
import { api, getBaseUrl } from '../services/api';
import { setCustomApiUrl } from '../services/storage';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { GlassCard } from '../components/GlassCard';
import { radius, spacing, typography } from '../theme';
import { ThemeMode } from '../types';
import { isExpoGo, sendLocalNotification } from '../services/notificationService';

export const SettingsScreen: React.FC = () => {
  const {
    user,
    logout,
    isBiometricSupported,
    biometricType,
    isBiometricActive,
    toggleBiometrics,
    sendEmailVerification,
    sendPhoneOtp
  } = useAuth();
  const { themeMode, setThemeMode, reduceMotion, setReduceMotion, colors } = useTheme();
  const { syncOfflineQueue, offlineQueueCount } = useFinance();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleToggleBiometrics = async (val: boolean) => {
    const success = await toggleBiometrics(val);
    if (!success && val) {
      Alert.alert('Authentication Failed', 'Could not verify biometric identity.');
    }
  };

  const handleSaveApiUrl = async () => {
    await setCustomApiUrl(apiUrl.trim());
    Alert.alert('Host Configured', 'Base API host updated. Please restart the app or refresh.');
  };

  const handleTestNotification = async () => {
    try {
      await sendLocalNotification(
        '⚠️ Budget Alert (80% Used)',
        'You have used 80% of your monthly Food & Dining budget limit.',
        { type: 'budget' }
      );
      await api.triggerTestNotification('budget').catch(() => {});
      Alert.alert(
        'Notification Triggered',
        isExpoGo
          ? 'Local alert banner dispatched! (Note: Remote push requires a Development Build in SDK 53+).'
          : 'Alert notification dispatched to device!'
      );
    } catch (err: any) {
      Alert.alert('Notice', 'Notification event queued locally.');
    }
  };

  const handleVerifyEmail = async () => {
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const msg = await sendEmailVerification();
      Alert.alert('Verification Link Sent', msg || 'Please check your registered inbox.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const cooldown = await sendPhoneOtp();
      Alert.alert('6-Digit OTP Sent', `A verification code was dispatched to your phone (Cooldown: ${cooldown}s).`);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.subTitle, { color: colors.textMuted }]}>PREFERENCES & SECURITY</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
        </View>

        {/* User Account Card */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.userHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name || 'Authorized User'}</Text>
              <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user?.email}</Text>
            </View>
          </View>

          {/* Verification Badges */}
          <View style={[styles.verificationRow, { borderTopColor: colors.borderSubtle }]}>
            <View style={styles.vItem}>
              <Ionicons
                name={user?.emailVerified ? 'checkmark-circle' : 'alert-circle'}
                size={16}
                color={user?.emailVerified ? colors.income : colors.warning}
              />
              <Text style={[styles.vLabel, { color: colors.textSecondary }]}>
                Email {user?.emailVerified ? 'Verified' : 'Pending'}
              </Text>
              {!user?.emailVerified && (
                <TouchableOpacity onPress={handleVerifyEmail} disabled={isVerifying}>
                  <Text style={[styles.verifyLink, { color: colors.primary }]}>Verify</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.vItem}>
              <Ionicons
                name={user?.phoneVerified ? 'checkmark-circle' : 'alert-circle'}
                size={16}
                color={user?.phoneVerified ? colors.income : colors.warning}
              />
              <Text style={[styles.vLabel, { color: colors.textSecondary }]}>
                Phone {user?.phoneVerified ? 'Verified' : 'Pending'}
              </Text>
              {!user?.phoneVerified && (
                <TouchableOpacity onPress={handleVerifyPhone} disabled={isVerifying}>
                  <Text style={[styles.verifyLink, { color: colors.primary }]}>Verify</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </GlassCard>

        {/* Appearance Section */}
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Appearance</Text>
        <GlassCard style={styles.sectionCard}>
          <Text style={[styles.settingLabel, { color: colors.textMuted }]}>COLOR THEME</Text>
          <View style={[styles.themePillsWrap, { backgroundColor: colors.cardSecondary }]}>
            {(['light', 'dark', 'galaxy'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.themePill,
                  { flexDirection: 'row', justifyContent: 'center' },
                  themeMode === mode && { backgroundColor: colors.primary, borderRadius: radius.sm }
                ]}
                onPress={() => setThemeMode(mode)}
              >
                <Ionicons
                  name={mode === 'light' ? 'sunny' : mode === 'dark' ? 'moon' : 'planet'}
                  size={14}
                  color={themeMode === mode ? '#ffffff' : colors.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.themePillText,
                    { color: themeMode === mode ? '#ffffff' : colors.textSecondary },
                    themeMode === mode && { fontWeight: '700' }
                  ]}
                >
                  {mode === 'light' ? 'Light' : mode === 'dark' ? 'Dark' : 'Galaxy'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.toggleRow, { borderTopColor: colors.borderSubtle, marginTop: spacing.md }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Reduce Motion</Text>
              <Text style={[styles.toggleSub, { color: colors.textMuted }]}>
                Disables continuous 3D celestial rotations and spring transitions
              </Text>
            </View>
            <Switch
              value={reduceMotion}
              onValueChange={setReduceMotion}
              trackColor={{ false: colors.cardSecondary, true: colors.primary }}
            />
          </View>
        </GlassCard>

        {/* Security Section */}
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Security</Text>
        <GlassCard style={styles.sectionCard}>
          {isBiometricSupported ? (
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>
                  {biometricType} Authentication
                </Text>
                <Text style={[styles.toggleSub, { color: colors.textMuted }]}>
                  Securely unlock your galaxy wallet with biometrics
                </Text>
              </View>
              <Switch
                value={isBiometricActive}
                onValueChange={handleToggleBiometrics}
                trackColor={{ false: colors.cardSecondary, true: colors.primary }}
              />
            </View>
          ) : (
            <Text style={[styles.toggleSub, { color: colors.textMuted }]}>
              Biometric hardware not enrolled or unavailable on this device.
            </Text>
          )}
        </GlassCard>

        {/* Notifications & Alerts */}
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Notifications & Cloud Alerts</Text>
        <GlassCard style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleTestNotification}
          >
            <View style={styles.actionLeft}>
              <Ionicons name="notifications-outline" size={20} color={colors.primary} style={{ marginRight: 10 }} />
              <View>
                <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Test Device Notification</Text>
                <Text style={[styles.actionSub, { color: colors.textMuted }]}>
                  {isExpoGo ? 'Dispatches native local budget alert banner' : 'Dispatches cloud push alert'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {isExpoGo && (
            <View style={[styles.expoGoNote, { backgroundColor: 'rgba(6, 182, 212, 0.1)', borderColor: 'rgba(6, 182, 212, 0.25)' }]}>
              <Ionicons name="information-circle-outline" size={16} color="#06b6d4" style={{ marginRight: 6 }} />
              <Text style={[styles.expoGoNoteText, { color: colors.textSecondary }]}>
                Push notifications require a Development Build (unsupported in Expo Go since SDK 53). Local alerts remain fully active.
              </Text>
            </View>
          )}
        </GlassCard>

        {/* Offline Sync & Diagnostics */}
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Offline Queue & Diagnostics</Text>
        <GlassCard style={styles.sectionCard}>
          <View style={styles.actionRow}>
            <View style={styles.actionLeft}>
              <Ionicons name="cloud-offline-outline" size={20} color={colors.warning} style={{ marginRight: 10 }} />
              <View>
                <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Queued Transactions</Text>
                <Text style={[styles.actionSub, { color: colors.textMuted }]}>
                  {offlineQueueCount} local record{offlineQueueCount !== 1 ? 's' : ''} awaiting sync
                </Text>
              </View>
            </View>
            {offlineQueueCount > 0 && (
              <TouchableOpacity
                style={[styles.syncBtnSmall, { backgroundColor: colors.primary }]}
                onPress={() => syncOfflineQueue()}
              >
                <Text style={styles.syncBtnTextSmall}>Sync</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Custom Server Host Override for LAN testing */}
          <View style={[styles.customHostWrap, { borderTopColor: colors.borderSubtle }]}>
            <TouchableOpacity
              style={styles.hostHeader}
              onPress={() => setShowApiConfig(prev => !prev)}
            >
              <Text style={[styles.hostTitle, { color: colors.textMuted }]}>Server Connection Config</Text>
              <Ionicons name={showApiConfig ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
            </TouchableOpacity>

            {showApiConfig && (
              <View style={{ marginTop: spacing.sm }}>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
                  placeholder="e.g. http://192.168.1.100:5000"
                  placeholderTextColor={colors.textMuted}
                  value={apiUrl}
                  onChangeText={setApiUrl}
                />
                <TouchableOpacity
                  style={[styles.saveHostBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSaveApiUrl}
                >
                  <Text style={styles.saveHostText}>Save Server Host</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </GlassCard>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.card, borderColor: colors.expense }]}
          onPress={() => setShowLogoutConfirm(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.expense} style={{ marginRight: 8 }} />
          <Text style={[styles.logoutText, { color: colors.expense }]}>Sign Out of Galaxy Finance</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        visible={showLogoutConfirm}
        title="Sign Out?"
        message="Are you sure you want to end your current session? You will need your password or biometrics to log back in."
        confirmLabel="Sign Out"
        onConfirm={async () => {
          setShowLogoutConfirm(false);
          await logout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    padding: spacing.lg,
    paddingBottom: 80
  },
  header: {
    marginBottom: spacing.lg
  },
  subTitle: {
    ...typography.micro,
    fontWeight: '700',
    letterSpacing: 1
  },
  title: {
    ...typography.h2,
    marginTop: 2
  },
  sectionHeading: {
    ...typography.h3,
    marginTop: spacing.md,
    marginBottom: spacing.sm
  },
  sectionCard: {
    marginBottom: spacing.md
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700'
  },
  userName: {
    ...typography.bodyBold,
    fontSize: 16
  },
  userEmail: {
    ...typography.caption,
    marginTop: 2
  },
  verificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: spacing.md,
    marginTop: spacing.md
  },
  vItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  vLabel: {
    fontSize: 12
  },
  verifyLink: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4
  },
  settingLabel: {
    ...typography.micro,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6
  },
  themePillsWrap: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: 3
  },
  themePill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.sm
  },
  themePillText: {
    fontSize: 12
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm
  },
  toggleTitle: {
    ...typography.bodyBold
  },
  toggleSub: {
    ...typography.caption,
    marginTop: 2,
    lineHeight: 16
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionTitle: {
    ...typography.bodyBold
  },
  actionSub: {
    ...typography.caption,
    marginTop: 2
  },
  syncBtnSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm
  },
  syncBtnTextSmall: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  customHostWrap: {
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    marginTop: spacing.md
  },
  hostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  hostTitle: {
    ...typography.micro,
    letterSpacing: 0.8
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: 13
  },
  saveHostBtn: {
    paddingVertical: 8,
    borderRadius: radius.sm,
    alignItems: 'center',
    marginTop: spacing.sm
  },
  saveHostText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.lg
  },
  logoutText: {
    fontWeight: '700',
    fontSize: 14
  },
  expoGoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginTop: spacing.sm
  },
  expoGoNoteText: {
    ...typography.caption,
    flexShrink: 1,
    lineHeight: 16
  }
});
