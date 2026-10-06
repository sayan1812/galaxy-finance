import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { maskAccountNumber, formatCurrency } from '../utils/formatters';
import { radius, spacing, typography } from '../theme';
import { BankAccount } from '../types';

export const BanksScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { banks, overview, isRefreshing, refreshData, deleteBank } = useFinance();
  const [deletingBank, setDeletingBank] = useState<BankAccount | null>(null);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            tintColor={colors.primary}
          />
        }
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.subTitle, { color: colors.textMuted }]}>CELESTIAL VAULTS</Text>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Bank Accounts</Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('AddBankModal')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.addBtnText}>Add Bank</Text>
          </TouchableOpacity>
        </View>

        {/* Total Bank Balance Card */}
        <GlassCard borderGlow glowColor={colors.primaryGlow} style={styles.totalCard}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>TOTAL BANK BALANCE</Text>
          <AnimatedNumber
            value={overview.totalBankBalance}
            style={[styles.totalAmount, { color: colors.textPrimary }]}
          />
          <View style={styles.vaultStatsRow}>
            <View style={styles.statItem}>
              <Ionicons name="planet" size={14} color={colors.secondary} style={{ marginRight: 4 }} />
              <Text style={[styles.statText, { color: colors.textMuted }]}>
                {banks.length} Linked Vault{banks.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="cash" size={14} color={colors.cash} style={{ marginRight: 4 }} />
              <Text style={[styles.statText, { color: colors.textMuted }]}>
                Cash: {formatCurrency(overview.cashBalance)}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Banks List */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Connected Institutions</Text>

        {banks.map(bank => (
          <GlassCard
            key={bank.id}
            style={styles.bankCard}
            onPress={() => navigation.navigate('BankDetail', { bank })}
          >
            <View style={styles.bankCardInner}>
              <View style={[styles.planetIconWrap, { backgroundColor: `${bank.planetColor || colors.primary}20` }]}>
                <View style={[styles.planetDot, { backgroundColor: bank.planetColor || colors.primary }]} />
              </View>

              <View style={styles.bankInfo}>
                <View style={styles.nameRow}>
                  <Text style={[styles.bankName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {bank.nickname || bank.bankName}
                  </Text>
                  <Text style={[styles.balance, { color: colors.textPrimary }]}>
                    {formatCurrency(bank.balance)}
                  </Text>
                </View>

                <View style={styles.subRow}>
                  <Text style={[styles.accType, { color: colors.textMuted }]}>
                    {bank.bankName} · {bank.accountType}
                  </Text>
                  <Text style={[styles.maskedAcc, { color: colors.textMuted }]}>
                    {maskAccountNumber(bank.maskedAccountNumber)}
                  </Text>
                </View>

                {/* Actions bottom row */}
                <View style={[styles.cardFooter, { borderTopColor: colors.borderSubtle }]}>
                  <TouchableOpacity
                    style={styles.footerAction}
                    onPress={() => navigation.navigate('BankDetail', { bank })}
                  >
                    <Ionicons name="analytics-outline" size={14} color={colors.primary} />
                    <Text style={[styles.footerActionText, { color: colors.primary }]}>Reconcile & Details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.footerAction}
                    onPress={() => setDeletingBank(bank)}
                  >
                    <Ionicons name="trash-outline" size={14} color={colors.expense} />
                    <Text style={[styles.footerActionText, { color: colors.expense }]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </GlassCard>
        ))}

        {banks.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="planet-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Bank Vaults Found</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              Add your savings and current accounts to populate your 3D Galaxy orbits.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={Boolean(deletingBank)}
        title="Remove Bank Account?"
        message={`Are you sure you want to remove ${deletingBank?.nickname || deletingBank?.bankName}? This will disassociate linked transactions.`}
        confirmLabel="Remove"
        onConfirm={async () => {
          if (deletingBank) {
            await deleteBank(deletingBank.id);
            setDeletingBank(null);
          }
        }}
        onCancel={() => setDeletingBank(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 80
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  subTitle: {
    ...typography.micro,
    fontWeight: '700',
    letterSpacing: 1
  },
  title: {
    ...typography.h1
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  totalCard: {
    marginBottom: spacing.xl
  },
  totalLabel: {
    ...typography.captionBold,
    letterSpacing: 0.5
  },
  totalAmount: {
    ...typography.hero,
    fontSize: 32,
    marginVertical: 4
  },
  vaultStatsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xs
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statText: {
    ...typography.caption
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md
  },
  bankCard: {
    marginBottom: spacing.md,
    padding: spacing.md
  },
  bankCardInner: {
    flexDirection: 'row'
  },
  planetIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md
  },
  planetDot: {
    width: 20,
    height: 20,
    borderRadius: 10
  },
  bankInfo: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2
  },
  bankName: {
    ...typography.bodyBold,
    fontSize: 15,
    flexShrink: 1,
    marginRight: spacing.sm
  },
  balance: {
    ...typography.bodyBold,
    fontSize: 16
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  accType: {
    ...typography.caption
  },
  maskedAcc: {
    ...typography.captionBold,
    letterSpacing: 0.5
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  footerActionText: {
    fontSize: 11,
    fontWeight: '600'
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xxl
  },
  emptyTitle: {
    ...typography.h3,
    marginTop: spacing.md
  },
  emptySub: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: 4
  }
});
