import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/ThemeContext';
import { CATEGORIES, PAYMENT_METHODS, getLocalDateString, getLocalTimeString } from '../utils/formatters';
import { radius, spacing, typography } from '../theme';
import { TransactionType, PaymentMethod } from '../types';

export const AddTransactionModal: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { colors } = useTheme();
  const { banks, addTransaction, updateTransaction } = useFinance();

  const editTx = route.params?.editTransaction;
  const initialType: TransactionType = route.params?.initialType || (editTx?.type || 'expense');
  const prefillPayment: PaymentMethod = route.params?.prefillPayment || (editTx?.paymentMethod || 'UPI');
  const isTransferMode = Boolean(route.params?.isTransfer);

  // Form State
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState(editTx ? String(editTx.amount) : '');
  const [category, setCategory] = useState(editTx ? editTx.category : isTransferMode ? 'Transfer' : 'Food & Dining');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(prefillPayment);
  const [bankId, setBankId] = useState<string | null>(editTx?.bankId || (banks[0]?.id || null));
  const [merchant, setMerchant] = useState(editTx?.merchant || '');
  const [description, setDescription] = useState(editTx?.description || '');
  const [date, setDate] = useState(editTx?.date || getLocalDateString());
  const [time, setTime] = useState(editTx?.time || getLocalTimeString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (isSubmitting) return; // Prevent double-tap submission

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than ₹0.');
      return;
    }

    if (!category) {
      Alert.alert('Category Required', 'Please select a transaction category.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editTx) {
        await updateTransaction(editTx.id, {
          amount: parsedAmount,
          type,
          category,
          paymentMethod,
          bankId: paymentMethod === 'Cash' ? null : bankId,
          merchant: merchant.trim() || undefined,
          description: description.trim() || undefined,
          date,
          time
        });
      } else {
        await addTransaction({
          amount: parsedAmount,
          type,
          category,
          paymentMethod,
          bankId: paymentMethod === 'Cash' ? null : bankId,
          merchant: merchant.trim() || undefined,
          description: description.trim() || undefined,
          date,
          time,
          source: 'Manual'
        });
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not save transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Modal Top Bar */}
        <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {editTx ? 'Edit Transaction' : isTransferMode ? 'Account Transfer' : 'Quick Add'}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSubmitting}
            style={[styles.saveHeaderBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.saveHeaderText}>{isSubmitting ? '...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Income vs Expense Toggle */}
          <View style={[styles.typeToggleContainer, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
            <TouchableOpacity
              style={[
                styles.typeToggleBtn,
                type === 'expense' && { backgroundColor: colors.expense }
              ]}
              onPress={() => setType('expense')}
            >
              <Text
                style={[
                  styles.typeToggleText,
                  { color: type === 'expense' ? '#ffffff' : colors.textMuted }
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeToggleBtn,
                type === 'income' && { backgroundColor: colors.income }
              ]}
              onPress={() => setType('income')}
            >
              <Text
                style={[
                  styles.typeToggleText,
                  { color: type === 'income' ? '#ffffff' : colors.textMuted }
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>

          {/* Large Amount Field */}
          <View style={[styles.amountCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.currencySymbol, { color: type === 'expense' ? colors.expense : colors.income }]}>
              ₹
            </Text>
            <TextInput
              style={[styles.amountInput, { color: colors.textPrimary }]}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoFocus={!editTx}
            />
          </View>

          {/* Category Picker */}
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>CATEGORY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {CATEGORIES.map(cat => {
              const isSelected = category === cat.name;
              return (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? `${cat.color}25` : colors.card,
                      borderColor: isSelected ? cat.color : colors.borderSubtle
                    }
                  ]}
                  onPress={() => setCategory(cat.name)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={isSelected ? cat.color : colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? cat.color : colors.textSecondary, fontWeight: isSelected ? '700' : '500' }
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Payment Method Picker */}
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>PAYMENT METHOD</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {PAYMENT_METHODS.map(pm => {
              const isSelected = paymentMethod === pm.name;
              return (
                <TouchableOpacity
                  key={pm.name}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? `${pm.color}25` : colors.card,
                      borderColor: isSelected ? pm.color : colors.borderSubtle
                    }
                  ]}
                  onPress={() => setPaymentMethod(pm.name as PaymentMethod)}
                >
                  <Ionicons
                    name={pm.icon as any}
                    size={16}
                    color={isSelected ? pm.color : colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? pm.color : colors.textSecondary, fontWeight: isSelected ? '700' : '500' }
                    ]}
                  >
                    {pm.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Bank Account Selection (if not Cash) */}
          {paymentMethod !== 'Cash' && banks.length > 0 && (
            <View>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>SELECT BANK VAULT</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                {banks.map(b => {
                  const isSelected = bankId === b.id;
                  return (
                    <TouchableOpacity
                      key={b.id}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? `${b.planetColor || colors.primary}25` : colors.card,
                          borderColor: isSelected ? (b.planetColor || colors.primary) : colors.borderSubtle
                        }
                      ]}
                      onPress={() => setBankId(b.id)}
                    >
                      <View
                        style={[
                          styles.bankDot,
                          { backgroundColor: b.planetColor || colors.primary, marginRight: 6 }
                        ]}
                      />
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: isSelected ? (b.planetColor || colors.primary) : colors.textSecondary,
                            fontWeight: isSelected ? '700' : '500'
                          }
                        ]}
                      >
                        {b.nickname || b.bankName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Merchant / Payee */}
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>MERCHANT / PERSON (OPTIONAL)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
            placeholder="e.g. Swiggy, Amazon, Friend's Name"
            placeholderTextColor={colors.textMuted}
            value={merchant}
            onChangeText={setMerchant}
          />

          {/* Note / Description */}
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>NOTE / DESCRIPTION</Text>
          <TextInput
            style={[styles.input, styles.multilineInput, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
            placeholder="e.g. Dinner with team"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={2}
            value={description}
            onChangeText={setDescription}
          />

          {/* Date & Time Row */}
          <View style={styles.dateTimeRow}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>DATE</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>TIME</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
                value={time}
                onChangeText={setTime}
                placeholder="HH:MM"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
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
  saveHeaderBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full
  },
  saveHeaderText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 40
  },
  typeToggleContainer: {
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 3,
    marginBottom: spacing.md
  },
  typeToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.sm
  },
  typeToggleText: {
    fontSize: 14,
    fontWeight: '700'
  },
  amountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    marginRight: 6
  },
  amountInput: {
    fontSize: 36,
    fontWeight: '700',
    minWidth: 140,
    textAlign: 'center'
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
    paddingVertical: 2
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1
  },
  chipText: {
    fontSize: 13
  },
  bankDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top'
  },
  dateTimeRow: {
    flexDirection: 'row',
    marginTop: spacing.xs
  }
});
