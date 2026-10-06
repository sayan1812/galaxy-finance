import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/ThemeContext';
import { useAuth } from '../store/AuthContext';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { Galaxy3DCanvas } from '../components/Galaxy3DCanvas';
import { GlassCard } from '../components/GlassCard';
import { SwipeableTransactionItem } from '../components/SwipeableTransactionItem';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { OfflineBanner } from '../components/OfflineBanner';
import { MicroReaction } from '../components/MicroReaction';
import { formatCurrency } from '../utils/formatters';
import { radius, spacing, typography } from '../theme';
import { Transaction } from '../types';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const {
    overview,
    banks,
    transactions,
    isRefreshing,
    refreshData,
    deleteTransaction,
    activeReaction,
    clearReaction
  } = useFinance();

  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  const netChange = overview.totalIncome - overview.totalExpense;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <OfflineBanner />
      <MicroReaction type={activeReaction} onDismiss={clearReaction} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={[styles.greetingSub, { color: colors.textMuted }]}>COMMAND CENTER</Text>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>
              {user ? user.name : 'Cosmic Explorer'}
            </Text>
          </View>

          <View style={styles.headerActions}>
            {/* AI Shortcut */}
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}
              onPress={() => navigation.navigate('GalaxyAi')}
              activeOpacity={0.7}
            >
              <Ionicons name="sparkles" size={18} color={colors.primary} />
            </TouchableOpacity>

            {/* Light Mode Indicator */}
            <View
              style={[styles.headerBtn, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}
            >
              <Ionicons
                name="sunny"
                size={18}
                color="#f59e0b"
              />
            </View>

            {/* Notifications */}
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}
              onPress={() => navigation.navigate('Notifications')}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* HERO CARD: NET AVAILABLE MONEY */}
        <View style={styles.heroWrapper}>
          <GlassCard
            borderGlow
            glowColor={colors.primaryGlow}
            style={styles.heroCard}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.pillLabel}>
                <Ionicons name="shield-checkmark" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.pillLabelText, { color: colors.primary }]}>TRUE LIQUID BALANCE</Text>
              </View>
              <Text style={[styles.heroDate, { color: colors.textMuted }]}>
                {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </Text>
            </View>

            <Text style={[styles.heroSubTitle, { color: colors.textSecondary }]}>NET AVAILABLE MONEY</Text>
            <AnimatedNumber
              value={overview.netAvailableMoney}
              style={[styles.heroAmount, { color: colors.textPrimary }]}
            />

            {/* Secondary Balances Row */}
            <View style={[styles.balancePillRow, { borderTopColor: colors.borderSubtle }]}>
              <View style={styles.balanceSubItem}>
                <Text style={[styles.balanceSubLabel, { color: colors.textMuted }]}>Bank Balance</Text>
                <AnimatedNumber
                  value={overview.totalBankBalance}
                  style={[styles.balanceSubVal, { color: colors.secondary }]}
                />
              </View>

              <View style={[styles.dividerVertical, { backgroundColor: colors.borderSubtle }]} />

              <View style={styles.balanceSubItem}>
                <Text style={[styles.balanceSubLabel, { color: colors.textMuted }]}>Cash Wallet</Text>
                <AnimatedNumber
                  value={overview.cashBalance}
                  style={[styles.balanceSubVal, { color: colors.cash }]}
                />
              </View>
            </View>

            {/* Income & Expense Row */}
            <View style={[styles.flowRow, { backgroundColor: colors.cardSecondary }]}>
              <View style={styles.flowItem}>
                <Ionicons name="arrow-down-circle" size={16} color={colors.income} style={{ marginRight: 4 }} />
                <Text style={[styles.flowLabel, { color: colors.textMuted }]}>In: </Text>
                <Text style={[styles.flowValue, { color: colors.income }]}>
                  {formatCurrency(overview.totalIncome)}
                </Text>
              </View>

              <View style={styles.flowItem}>
                <Ionicons name="arrow-up-circle" size={16} color={colors.expense} style={{ marginRight: 4 }} />
                <Text style={[styles.flowLabel, { color: colors.textMuted }]}>Out: </Text>
                <Text style={[styles.flowValue, { color: colors.expense }]}>
                  {formatCurrency(overview.totalExpense)}
                </Text>
              </View>

              <View style={styles.flowItem}>
                <Text style={[styles.flowLabel, { color: colors.textMuted }]}>Net: </Text>
                <Text style={[styles.flowValue, { color: netChange >= 0 ? colors.income : colors.expense }]}>
                  {netChange >= 0 ? '+' : ''}{formatCurrency(netChange)}
                </Text>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* 3D GALAXY MOBILE INTERACTIVE DASHBOARD */}
        <Galaxy3DCanvas
          netAvailableMoney={overview.netAvailableMoney}
          cashBalance={overview.cashBalance}
          banks={banks}
          onSelectBank={(bank) => navigation.navigate('BankDetail', { bank })}
          onSelectCash={() => navigation.navigate('AddModal', { prefillPayment: 'Cash' })}
          onSelectCore={() => navigation.navigate('Reports')}
        />

        {/* QUICK ADD ACTION BUTTONS */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: colors.expenseBg, borderColor: colors.expense }]}
            onPress={() => navigation.navigate('AddModal', { initialType: 'expense' })}
            activeOpacity={0.7}
          >
            <Ionicons name="remove-circle" size={20} color={colors.expense} />
            <Text style={[styles.quickBtnText, { color: colors.expense }]}>+ Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: colors.incomeBg, borderColor: colors.income }]}
            onPress={() => navigation.navigate('AddModal', { initialType: 'income' })}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={20} color={colors.income} />
            <Text style={[styles.quickBtnText, { color: colors.income }]}>+ Income</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: colors.cashBg, borderColor: colors.cash }]}
            onPress={() => navigation.navigate('AddModal', { prefillPayment: 'Cash' })}
            activeOpacity={0.7}
          >
            <Ionicons name="cash-outline" size={20} color={colors.cash} />
            <Text style={[styles.quickBtnText, { color: colors.cash }]}>+ Cash</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: 'rgba(99, 102, 241, 0.15)', borderColor: '#6366f1' }]}
            onPress={() => navigation.navigate('AddModal', { isTransfer: true })}
            activeOpacity={0.7}
          >
            <Ionicons name="swap-horizontal" size={20} color="#818cf8" />
            <Text style={[styles.quickBtnText, { color: '#818cf8' }]}>Transfer</Text>
          </TouchableOpacity>
        </View>

        {/* BANK ACCOUNTS VAULT SUMMARY */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Bank Vaults</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Banks')}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>View All ({banks.length})</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {banks.map(bank => (
            <TouchableOpacity
              key={bank.id}
              style={[styles.bankVaultCard, { backgroundColor: colors.card, borderColor: bank.planetColor || colors.border }]}
              onPress={() => navigation.navigate('BankDetail', { bank })}
              activeOpacity={0.75}
            >
              <View style={styles.bankVaultTop}>
                <View style={[styles.bankDot, { backgroundColor: bank.planetColor || colors.primary }]} />
                <Text style={[styles.bankTypeBadge, { color: colors.textMuted }]}>{bank.accountType}</Text>
              </View>
              <Text style={[styles.bankName, { color: colors.textPrimary }]} numberOfLines={1}>
                {bank.nickname || bank.bankName}
              </Text>
              <Text style={[styles.bankBalance, { color: colors.textPrimary }]}>
                {formatCurrency(bank.balance)}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Add Bank Card */}
          <TouchableOpacity
            style={[styles.bankVaultCard, styles.addBankCard, { borderColor: colors.borderSubtle }]}
            onPress={() => navigation.navigate('AddBankModal')}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={24} color={colors.primary} />
            <Text style={[styles.addBankText, { color: colors.primary }]}>Add Vault</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* RECENT TRANSACTIONS TIMELINE */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        {transactions.slice(0, 6).map(tx => (
          <SwipeableTransactionItem
            key={tx.id || tx.localId}
            transaction={tx}
            onEdit={targetTx => navigation.navigate('AddModal', { editTransaction: targetTx })}
            onDelete={targetTx => setDeletingTx(targetTx)}
          />
        ))}

        {transactions.length === 0 && (
          <View style={styles.emptyWrap}>
            <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No transactions logged yet. Tap + to begin!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={Boolean(deletingTx)}
        title="Delete Transaction?"
        message={`Are you sure you want to delete ${deletingTx?.merchant || deletingTx?.category} (${formatCurrency(deletingTx?.amount)})? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deletingTx) {
            await deleteTransaction(deletingTx.id);
            setDeletingTx(null);
          }
        }}
        onCancel={() => setDeletingTx(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  contentContainer: {
    paddingBottom: 80
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm
  },
  greetingSub: {
    ...typography.micro,
    fontWeight: '700',
    letterSpacing: 1.2
  },
  userName: {
    ...typography.h2,
    marginTop: 2
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  heroWrapper: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm
  },
  heroCard: {
    padding: spacing.lg
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  pillLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full
  },
  pillLabelText: {
    fontSize: 10,
    fontWeight: '700'
  },
  heroDate: {
    ...typography.caption
  },
  heroSubTitle: {
    ...typography.captionBold,
    marginTop: spacing.xs,
    letterSpacing: 0.8
  },
  heroAmount: {
    ...typography.hero,
    fontSize: 34,
    marginVertical: 4
  },
  balancePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: spacing.md,
    marginTop: spacing.sm
  },
  balanceSubItem: {
    flex: 1
  },
  balanceSubLabel: {
    ...typography.caption
  },
  balanceSubVal: {
    ...typography.bodyBold,
    fontSize: 16,
    marginTop: 2
  },
  dividerVertical: {
    width: 1,
    height: 30,
    marginHorizontal: spacing.md
  },
  flowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md
  },
  flowItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  flowLabel: {
    fontSize: 12
  },
  flowValue: {
    fontSize: 12,
    fontWeight: '700'
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.md,
    gap: 8
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 4
  },
  quickBtnText: {
    fontSize: 12,
    fontWeight: '700'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm
  },
  sectionTitle: {
    ...typography.h3
  },
  seeAllText: {
    ...typography.captionBold
  },
  horizontalScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md
  },
  bankVaultCard: {
    width: 140,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5
  },
  bankVaultTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  bankDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  bankTypeBadge: {
    fontSize: 10
  },
  bankName: {
    ...typography.captionBold,
    fontSize: 13,
    marginBottom: 2
  },
  bankBalance: {
    ...typography.bodyBold,
    fontSize: 14
  },
  addBankCard: {
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center'
  },
  addBankText: {
    ...typography.captionBold,
    marginTop: 4
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
