import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/layout';
import { useResponsive } from '../../hooks/useResponsive';
import { useHaptics } from '../../hooks/useHaptics';
import { GalaxyCanvas } from '../../components/canvas/GalaxyCanvas';
import { PressableScale } from '../../components/common/PressableScale';
import { useAuth } from '../../store/AuthContext';
import { signInWithEmail, signUpWithEmail } from '../../services/firebase';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { typography } = useResponsive();
  const { triggerLight, triggerMedium, triggerSuccess, triggerError } = useHaptics();
  const { login } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      triggerError();
      return;
    }

    setErrorMsg('');
    setLoading(true);
    triggerMedium();

    try {
      if (isRegisterMode) {
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
      triggerSuccess();
      router.replace('/(app)/dashboard');
    } catch (err: any) {
      // Fallback to local AuthContext login if mock or demo
      try {
        await login(email, password);
        triggerSuccess();
        router.replace('/(app)/dashboard');
      } catch (innerErr: any) {
        setErrorMsg(err?.message || 'Authentication failed. Please verify credentials.');
        triggerError();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    triggerMedium();
    try {
      await login('demo@galaxyfinance.io', 'DemoPass123!');
      triggerSuccess();
      router.replace('/(app)/dashboard');
    } catch {
      router.replace('/(app)/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 60 FPS Native Galaxy Canvas Background */}
      <GalaxyCanvas />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Math.max(insets.top + 20, 40), paddingBottom: Math.max(insets.bottom + 20, 30) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Branding */}
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>✦</Text>
            </View>
            <Text style={[styles.brandTitle, { fontSize: typography.heroBalance }]}>
              GALAXY FINANCE
            </Text>
            <Text style={[styles.brandSubtitle, { fontSize: typography.bodyRegular }]}>
              Personal Financial Command Center
            </Text>
          </View>

          {/* Glassmorphic Form Card */}
          <View style={styles.formCard}>
            <Text style={[styles.formTitle, { fontSize: typography.cardHeader }]}>
              {isRegisterMode ? 'CREATE COMMANDER ACCOUNT' : 'ENTER COMMAND CENTER'}
            </Text>

            {errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {isRegisterMode && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { fontSize: typography.microMeta }]}>
                  NAME / CALLSIGN
                </Text>
                <TextInput
                  style={[styles.inputField, { fontSize: typography.bodyRegular }]}
                  placeholder="Alex Mercer"
                  placeholderTextColor={COLORS.slateDark}
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { fontSize: typography.microMeta }]}>
                EMAIL ADDRESS
              </Text>
              <TextInput
                style={[styles.inputField, { fontSize: typography.bodyRegular }]}
                placeholder="commander@galaxyfinance.io"
                placeholderTextColor={COLORS.slateDark}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { fontSize: typography.microMeta }]}>
                PASSWORD
              </Text>
              <TextInput
                style={[styles.inputField, { fontSize: typography.bodyRegular }]}
                placeholder="••••••••••••"
                placeholderTextColor={COLORS.slateDark}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Primary Action Button with Micro Compression */}
            <PressableScale
              activeScale={0.985}
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.crispWhite} size="small" />
              ) : (
                <Text style={[styles.submitButtonText, { fontSize: typography.bodyRegular }]}>
                  {isRegisterMode ? 'Establish Account' : 'Authenticate Session'}
                </Text>
              )}
            </PressableScale>

            {/* Quick Demo Access */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleDemoSignIn}
              style={styles.demoButton}
            >
              <Text style={[styles.demoButtonText, { fontSize: typography.microMeta }]}>
                ⚡ Instant Commander Access (Demo Mode)
              </Text>
            </TouchableOpacity>

            {/* Toggle Sign In / Register */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                triggerLight();
                setIsRegisterMode(!isRegisterMode);
                setErrorMsg('');
              }}
              style={styles.toggleRow}
            >
              <Text style={[styles.toggleText, { fontSize: typography.bodySmall }]}>
                {isRegisterMode
                  ? 'Already registered? Sign In'
                  : 'New Commander? Create Account'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondaryAccent,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.primaryAccent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  logoIcon: {
    color: COLORS.primaryAccent,
    fontSize: 22,
    fontWeight: 'bold',
  },
  brandTitle: {
    color: COLORS.primaryText,
    fontWeight: '900',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  brandSubtitle: {
    color: COLORS.secondaryText,
    marginTop: 4,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: COLORS.cardSurface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
    shadowColor: '#2D2621',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  formTitle: {
    color: COLORS.primaryText,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: 'rgba(255, 177, 177, 0.35)',
    borderWidth: 1,
    borderColor: COLORS.errorUrgent,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: '#9C2525',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    color: COLORS.secondaryText,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  inputField: {
    backgroundColor: COLORS.canvas,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
    color: COLORS.primaryText,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 16,
    minHeight: 48,
  },
  submitButton: {
    backgroundColor: COLORS.primaryAccent,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    shadowColor: COLORS.primaryAccent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonText: {
    color: '#FAF7F3',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  demoButton: {
    marginTop: SPACING.md,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.canvas,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
  },
  demoButtonText: {
    color: COLORS.secondaryText,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  toggleRow: {
    marginTop: SPACING.lg,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  toggleText: {
    color: COLORS.secondaryText,
    fontWeight: '600',
  },
});
