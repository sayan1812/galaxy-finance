import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/ThemeContext';
import { radius, spacing, typography } from '../theme';

const POPULAR_BANKS = ['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Other'];
const ACCOUNT_TYPES = ['Savings', 'Current', 'Salary', 'Fixed Deposit', 'Other'];
const PLANET_COLORS = ['#38bdf8', '#818cf8', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export const AddBankModal: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { addBank } = useFinance();

  const [bankName, setBankName] = useState('HDFC Bank');
  const [customBankName, setCustomBankName] = useState('');
  const [accountType, setAccountType] = useState('Savings');
  const [nickname, setNickname] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [planetColor, setPlanetColor] = useState(PLANET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (isSubmitting) return;
    const finalBankName = bankName === 'Other' ? customBankName.trim() : bankName;
    if (!finalBankName) {
      Alert.alert('Required', 'Please specify the bank name.');
      return;
    }

    const balanceNum = parseFloat(openingBalance) || 0;
    if (balanceNum < 0) {
      Alert.alert('Invalid Balance', 'Opening balance cannot be negative.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addBank({
        bankName: finalBankName,
        accountType,
        nickname: nickname.trim() || undefined,
        openingBalance: balanceNum,
        maskedAccountNumber: accountNumber.trim() || undefined,
        planetColor
      });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not add bank vault.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Add Bank Vault</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSubmitting}
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.saveBtnText}>{isSubmitting ? '...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Security Alert Banner */}
        <View style={[styles.securityNotice, { backgroundColor: 'rgba(6, 182, 212, 0.1)', borderColor: 'rgba(6, 182, 212, 0.3)' }]}>
          <Ionicons name="shield-checkmark" size={18} color="#06b6d4" style={{ marginRight: 8 }} />
          <Text style={[styles.securityText, { color: colors.textSecondary }]}>
            Zero Credentials Policy: We NEVER ask for PINs, Net Banking passwords, OTPs, or CVVs. Account numbers are stored masked.
          </Text>
        </View>

        {/* Bank Name Selector */}
        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>SELECT INSTITUTION</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {POPULAR_BANKS.map(b => {
            const isSelected = bankName === b;
            return (
              <TouchableOpacity
                key={b}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? `${colors.primary}25` : colors.card,
                    borderColor: isSelected ? colors.primary : colors.borderSubtle
                  }
                ]}
                onPress={() => setBankName(b)}
              >
                <Text style={[styles.chipText, { color: isSelected ? colors.primary : colors.textSecondary, fontWeight: isSelected ? '700' : '500' }]}>
                  {b}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {bankName === 'Other' && (
          <View style={{ marginTop: spacing.sm }}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>CUSTOM BANK NAME</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
              placeholder="e.g. Standard Chartered"
              placeholderTextColor={colors.textMuted}
              value={customBankName}
              onChangeText={setCustomBankName}
            />
          </View>
        )}

        {/* Account Type */}
        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>ACCOUNT TYPE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {ACCOUNT_TYPES.map(type => {
            const isSelected = accountType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? `${colors.secondary}25` : colors.card,
                    borderColor: isSelected ? colors.secondary : colors.borderSubtle
                  }
                ]}
                onPress={() => setAccountType(type)}
              >
                <Text style={[styles.chipText, { color: isSelected ? colors.secondary : colors.textSecondary, fontWeight: isSelected ? '700' : '500' }]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Nickname */}
        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>ACCOUNT NICKNAME (OPTIONAL)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
          placeholder="e.g. My Salary Account, Emergency Fund"
          placeholderTextColor={colors.textMuted}
          value={nickname}
          onChangeText={setNickname}
        />

        {/* Opening Balance */}
        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>OPENING / CURRENT BALANCE (₹)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={openingBalance}
          onChangeText={setOpeningBalance}
        />

        {/* Account Number (Optional) */}
        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>ACCOUNT NUMBER (OPTIONAL)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
          placeholder="e.g. 501004521098"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={accountNumber}
          onChangeText={setAccountNumber}
        />

        {/* Galaxy Planet Color */}
        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>GALAXY PLANET COLOR</Text>
        <View style={styles.colorRow}>
          {PLANET_COLORS.map(c => {
            const isSelected = planetColor === c;
            return (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorCircle,
                  { backgroundColor: c },
                  isSelected && styles.colorCircleSelected
                ]}
                onPress={() => setPlanetColor(c)}
              >
                {isSelected && <Ionicons name="checkmark" size={16} color="#ffffff" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1
  },
  closeBtn: {
    padding: 4
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 17
  },
  saveBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 40
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md
  },
  securityText: {
    fontSize: 12,
    flexShrink: 1,
    lineHeight: 16
  },
  fieldLabel: {
    ...typography.micro,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: spacing.md,
    marginBottom: 6
  },
  chipsScroll: {
    gap: 8,
    paddingVertical: 4
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1
  },
  chipText: {
    fontSize: 13
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#ffffff'
  }
});
