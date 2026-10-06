import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { radius, spacing, typography } from '../theme';

type AuthTab = 'login' | 'register' | 'forgot_password' | 'verify_otp';

export const AuthScreen: React.FC = () => {
  const {
    login,
    register,
    forgotPassword,
    resetPassword,
    sendPhoneOtp,
    verifyPhoneOtp,
    isBiometricActive,
    unlockWithBiometrics,
    biometricType
  } = useAuth();
  const { colors } = useTheme();

  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [identifier, setIdentifier] = useState('demo@rupeewise.com');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);

  // Register Fields
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Forgot Password / OTP Fields
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleLogin = async () => {
    if (isLoading) return;
    if (!identifier.trim() || !password) {
      Alert.alert('Required', 'Please enter your email or phone and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(identifier.trim(), password);
    } catch (err: any) {
      Alert.alert('Sign In Failed', err.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const success = await unlockWithBiometrics();
      if (!success) {
        Alert.alert('Biometric Sign-In', 'Could not authenticate. Please enter your password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (isLoading) return;
    if (!name.trim() || !regEmail.trim() || !regPassword) {
      Alert.alert('Required', 'Please fill in all required registration fields.');
      return;
    }
    if (regPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const msg = await register(name.trim(), regEmail.trim(), regPhone.trim(), regPassword);
      Alert.alert('Account Created', msg || 'Welcome to Galaxy Finance!');
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRecoveryOtp = async () => {
    if (isLoading) return;
    if (!recoveryIdentifier.trim()) {
      Alert.alert('Required', 'Please enter your registered email or phone.');
      return;
    }

    setIsLoading(true);
    try {
      const msg = await forgotPassword(recoveryIdentifier.trim());
      setCooldown(60);
      Alert.alert('OTP Dispatched', msg || '6-digit recovery OTP sent.');
      setActiveTab('verify_otp');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (isLoading) return;
    if (!otpCode.trim() || otpCode.length < 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      Alert.alert('Password Length', 'New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Password Mismatch', 'New passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await resetPassword(recoveryIdentifier.trim(), otpCode.trim(), newPassword);
      if (success) {
        Alert.alert('Password Reset', 'Your password has been updated. Please sign in with your new password.');
        setActiveTab('login');
      }
    } catch (err: any) {
      Alert.alert('Reset Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View style={[styles.logoCircle, { backgroundColor: 'rgba(139, 92, 246, 0.2)', borderColor: colors.primary }]}>
              <Ionicons name="planet" size={44} color={colors.primary} />
            </View>
            <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>GALAXY FINANCE</Text>
            <Text style={[styles.brandSub, { color: colors.textMuted }]}>
              Autonomous Personal Wealth & Daily Transaction Engine
            </Text>
          </View>

          {/* Tab Navigation */}
          {activeTab !== 'forgot_password' && activeTab !== 'verify_otp' && (
            <View style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  activeTab === 'login' && { backgroundColor: colors.primary }
                ]}
                onPress={() => setActiveTab('login')}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === 'login' ? '#ffffff' : colors.textMuted }
                  ]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  activeTab === 'register' && { backgroundColor: colors.primary }
                ]}
                onPress={() => setActiveTab('register')}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === 'register' ? '#ffffff' : colors.textMuted }
                  ]}
                >
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* SIGN IN TAB */}
          {activeTab === 'login' && (
            <GlassCard style={styles.formCard}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>EMAIL / PHONE</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
                placeholder="demo@rupeewise.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={identifier}
                onChangeText={setIdentifier}
              />

              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>PASSWORD</Text>
              <View style={[styles.passwordWrap, { backgroundColor: colors.inputBg, borderColor: colors.borderSubtle }]}>
                <TextInput
                  style={[styles.passwordInput, { color: colors.textPrimary }]}
                  placeholder="••••••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => {
                  setRecoveryIdentifier(identifier);
                  setActiveTab('forgot_password');
                }}
              >
                <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.primaryActionText}>SIGN IN TO COMMAND CENTER</Text>
                )}
              </TouchableOpacity>

              {/* Biometric Quick Unlock */}
              {isBiometricActive && (
                <TouchableOpacity
                  style={[styles.biometricBtn, { borderColor: colors.borderSubtle }]}
                  onPress={handleBiometricLogin}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <Ionicons name="finger-print-outline" size={20} color={colors.secondary} style={{ marginRight: 8 }} />
                  <Text style={[styles.biometricText, { color: colors.textPrimary }]}>
                    Unlock with {biometricType}
                  </Text>
                </TouchableOpacity>
              )}
            </GlassCard>
          )}

          {/* REGISTER TAB */}
          {activeTab === 'register' && (
            <GlassCard style={styles.formCard}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>FULL NAME</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
                placeholder="Alex Mercer"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />

              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>EMAIL ADDRESS</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
                placeholder="alex@domain.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={regEmail}
                onChangeText={setRegEmail}
              />

              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>PHONE NUMBER (OPTIONAL)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
                placeholder="+91 98765 43210"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                value={regPhone}
                onChangeText={setRegPhone}
              />

              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>CREATE PASSWORD</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
                placeholder="At least 8 characters"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={regPassword}
                onChangeText={setRegPassword}
              />

              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>CONFIRM PASSWORD</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
                placeholder="Repeat password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: colors.primary, marginTop: spacing.lg }]}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.primaryActionText}>CREATE SECURE ACCOUNT</Text>
                )}
              </TouchableOpacity>
            </GlassCard>
          )}

          {/* FORGOT PASSWORD TAB */}
          {activeTab === 'forgot_password' && (
            <GlassCard style={styles.formCard}>
              <TouchableOpacity onPress={() => setActiveTab('login')} style={styles.backLink}>
                <Ionicons name="arrow-back" size={16} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.backLinkText, { color: colors.primary }]}>Back to Sign In</Text>
              </TouchableOpacity>

              <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Account Recovery</Text>
              <Text style={[styles.formSub, { color: colors.textMuted }]}>
                Enter your registered email or phone to receive a 6-digit recovery OTP.
              </Text>

              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>EMAIL / PHONE</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
                placeholder="registered@email.com"
                placeholderTextColor={colors.textMuted}
                value={recoveryIdentifier}
                onChangeText={setRecoveryIdentifier}
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: colors.primary, marginTop: spacing.lg }]}
                onPress={handleSendRecoveryOtp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.primaryActionText}>DISPATCH RECOVERY OTP</Text>
                )}
              </TouchableOpacity>
            </GlassCard>
          )}

          {/* VERIFY OTP & RESET PASSWORD TAB */}
          {activeTab === 'verify_otp' && (
            <GlassCard style={styles.formCard}>
              <TouchableOpacity onPress={() => setActiveTab('forgot_password')} style={styles.backLink}>
                <Ionicons name="arrow-back" size={16} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.backLinkText, { color: colors.primary }]}>Back</Text>
              </TouchableOpacity>

              <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Enter 6-Digit Code</Text>
              <Text style={[styles.formSub, { color: colors.textMuted }]}>
                Code sent to {recoveryIdentifier}
              </Text>

              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>6-DIGIT OTP</Text>
              <TextInput
                style={[styles.input, styles.otpInput, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
                placeholder="123456"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                maxLength={6}
                value={otpCode}
                onChangeText={setOtpCode}
              />

              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>NEW PASSWORD</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
                placeholder="At least 8 characters"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />

              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>CONFIRM NEW PASSWORD</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
                placeholder="Repeat new password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
              />

              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: colors.primary, marginTop: spacing.lg }]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.primaryActionText}>UPDATE PASSWORD & SIGN IN</Text>
                )}
              </TouchableOpacity>
            </GlassCard>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  keyboardView: {
    flex: 1
  },
  container: {
    padding: spacing.xl,
    paddingTop: 30,
    paddingBottom: 60
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  brandTitle: {
    ...typography.hero,
    fontSize: 26,
    letterSpacing: 2
  },
  brandSub: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 3,
    marginBottom: spacing.lg
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.sm
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700'
  },
  formCard: {
    padding: spacing.lg
  },
  formTitle: {
    ...typography.h2,
    marginBottom: 4
  },
  formSub: {
    ...typography.caption,
    marginBottom: spacing.md,
    lineHeight: 18
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: '600'
  },
  fieldLabel: {
    ...typography.micro,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: spacing.md,
    marginBottom: 6
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    fontSize: 14
  },
  otpInput: {
    letterSpacing: 6,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center'
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    fontSize: 14
  },
  eyeBtn: {
    padding: 10
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
    marginBottom: spacing.md
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600'
  },
  primaryActionBtn: {
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 12,
    marginTop: spacing.md
  },
  biometricText: {
    fontSize: 13,
    fontWeight: '600'
  }
});
