import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { SwipeableTransactionItem } from '../components/SwipeableTransactionItem';
import { formatCurrency, maskAccountNumber } from '../utils/formatters';
import { radius, spacing, typography } from '../theme';
import { BankAccount } from '../types';

export const BankDetailModal: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useTheme();
  const { transactions, adjustBankBalance, deleteTransaction } = useFinance();

  const bank: BankAccount = route.params?.bank;

  const [newBalance, setNewBalance] = useState('');
  const [reason, setReason] = useState('Reconciliation correction');
  const [isReconciling, setIsReconciling] = useState(false);
  const [showReconcileCard, setShowReconcileCard] = useState(false);

  if (!bank) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textPrimary, padding: 20 }}>Bank not found</Text>
      </SafeAreaView>
    );
  }

  // Filter transactions linked to this bank
  const bankTransactions = transactions.filter(t => t.bankId === bank.id);

  const bankIncome = bankTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const bankExpense = bankTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleReconcile = async () => {
    if (isReconciling) return;
    const parsed = parseFloat(newBalance);
    if (isNaN(parsed) || parsed < 0) {
      Alert.alert('Invalid Balance', 'Please enter a valid balance.');
      return;
    }
    if (!reason.trim()) {
      Alert.alert('Reason Required', 'Please provide an adjustment reason.');
      return;
    }

    setIsReconciling(true);
    try {
      await adjustBankBalance(bank.id, parsed, reason.trim());
      setShowReconcileCard(false);
      setNewBalance('');
      Alert.alert('Success', 'Bank balance updated and audit trail recorded.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not reconcile balance.');
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {bank.nickname || bank.bankName}
        </Text>
        <TouchableOpacity
          onPress={() => setShowReconcileCard(prev => !prev)}
          style={[styles.reconcileBtn, { backgroundColor: `${colors.primary}20` }]}
        >
          <Ionicons name="swap-vertical" size={16} color={colors.primary} style={{ marginRight: 4 }} />
          <Text style={[styles.reconcileBtnText, { color: colors.primary }]}>Reconcile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Bank Details */}
        <GlassCard borderGlow glowColor={bank.planetColor || colors.primary} style={styles.heroCard}>
          <View style={styles.bankTop}>
            <View style={[styles.dot, { backgroundColor: bank.planetColor || colors.primary }]} />
            <Text style={[styles.accNumber, { color: colors.textMuted }]}>
              {maskAccountNumber(bank.maskedAccountNumber)}
            </Text>
          </View>
          <Text style={[styles.bankName, { color: colors.textPrimary }]}>{bank.bankName}</Text>
          <Text style={[styles.accType, { color: colors.textSecondary }]}>{bank.accountType} Account</Text>

          <View style={[styles.balanceRow, { borderTopColor: colors.borderSubtle }]}>
            <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>CURRENT BALANCE</Text>
            <Text style={[styles.balanceAmount, { color: colors.textPrimary }]}>
              {formatCurrency(bank.balance)}
            </Text>
          </View>

          {/* Inflows & Outflows */}
          <View style={[styles.flowRow, { backgroundColor: colors.cardSecondary }]}>
            <View style={styles.flowItem}>
              <Text style={[styles.flowLabel, { color: colors.textMuted }]}>Inflows: </Text>
              <Text style={[styles.flowVal, { color: colors.income }]}>+{formatCurrency(bankIncome)}</Text>
            </View>
            <View style={styles.flowItem}>
              <Text style={[styles.flowLabel, { color: colors.textMuted }]}>Outflows: </Text>
              <Text style={[styles.flowVal, { color: colors.expense }]}>−{formatCurrency(bankExpense)}</Text>
            </View>
          </View>
        </GlassCard>

        {/* Reconcile Input Card */}
        {showReconcileCard && (
          <GlassCard style={styles.reconcileCard}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Audit Balance Adjustment</Text>
            <Text style={[styles.reconcileSub, { color: colors.textMuted }]}>
              Directly sets the vault's opening balance with a mandatory audit reason.
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>NEW ACTUAL BALANCE (₹)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
              placeholder={String(bank.balance)}
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={newBalance}
              onChangeText={setNewBalance}
            />

            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>REASON FOR ADJUSTMENT</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
              value={reason}
              onChangeText={setReason}
              placeholder="e.g. Cash deposit, Interest credit, Reconciliation"
              placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity
              style={[styles.submitReconcileBtn, { backgroundColor: colors.primary }]}
              onPress={handleReconcile}
              disabled={isReconciling}
            >
              <Text style={styles.submitReconcileText}>
                {isReconciling ? 'Updating...' : 'Commit Balance Adjustment'}
              </Text>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* Transactions Linked to Bank */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          Linked Transactions ({bankTransactions.length})
        </Text>

        {bankTransactions.map(tx => (
          <SwipeableTransactionItem
            key={tx.id || tx.localId}
            transaction={tx}
            onEdit={target => navigation.navigate('AddModal', { editTransaction: target })}
            onDelete={async target => {
              await deleteTransaction(target.id);
            }}
          />
        ))}

        {bankTransactions.length === 0 && (
          <View style={styles.emptyWrap}>
            <Ionicons name="receipt-outline" size={36} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No transactions recorded for this account yet.
            </Text>
          </View>
        )}
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
  backBtn: {
    padding: 4
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 17
  },
  reconcileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full
  },
  reconcileBtnText: {
    fontSize: 12,
    fontWeight: '700'
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 60
  },
  heroCard: {
    marginBottom: spacing.lg
  },
  bankTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  accNumber: {
    ...typography.captionBold,
    letterSpacing: 0.5
  },
  bankName: {
    ...typography.h2,
    marginTop: spacing.xs
  },
  accType: {
    ...typography.caption,
    marginTop: 2
  },
  balanceRow: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    marginTop: spacing.md
  },
  balanceLabel: {
    ...typography.micro,
    fontWeight: '700',
    letterSpacing: 1
  },
  balanceAmount: {
    ...typography.hero,
    fontSize: 30,
    marginTop: 2
  },
  flowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md
  },
  flowItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  flowLabel: {
    fontSize: 13
  },
  flowVal: {
    fontSize: 13,
    fontWeight: '700'
  },
  reconcileCard: {
    marginBottom: spacing.lg
  },
  sectionTitle: {
    ...typography.h3
  },
  reconcileSub: {
    ...typography.caption,
    marginTop: 2,
    marginBottom: spacing.md
  },
  fieldLabel: {
    ...typography.micro,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: spacing.sm,
    marginBottom: 4
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14
  },
  submitReconcileBtn: {
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.lg
  },
  submitReconcileText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14
  },
  emptyWrap: {
    alignItems: 'center',
    padding: spacing.xxl
  },
  emptyText: {
    ...typography.caption,
    marginTop: spacing.sm,
    textAlign: 'center'
  }
});
