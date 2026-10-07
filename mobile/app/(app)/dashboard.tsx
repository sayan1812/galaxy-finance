import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/layout';
import { useResponsive } from '../../hooks/useResponsive';
import { useHaptics } from '../../hooks/useHaptics';
import { useFinance } from '../../store/FinanceContext';
import { BalanceCard } from '../../components/dashboard/BalanceCard';
import { TransactionList } from '../../components/transactions/TransactionList';
import { PressableScale } from '../../components/common/PressableScale';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { typography } = useResponsive();
  const { triggerLight, triggerMedium, triggerSuccess } = useHaptics();

  const {
    overview,
    banks,
    transactions,
    isRefreshing,
    refreshData,
    addTransaction,
  } = useFinance();

  // One-Tap Quick Log Accelerators
  const quickItems = [
    { name: 'Tea & Snacks', cat: 'Food & Restaurant', amt: 40, mode: 'Cash' as const },
    { name: 'Coffee', cat: 'Food & Restaurant', amt: 120, mode: 'UPI' as const },
    { name: 'Metro / Auto', cat: 'Transportation', amt: 50, mode: 'Cash' as const },
    { name: 'Lunch / Swiggy', cat: 'Food & Restaurant', amt: 350, mode: 'UPI' as const },
    { name: 'Groceries', cat: 'Grocery', amt: 450, mode: 'UPI' as const },
  ];

  const handleQuickLog = async (item: typeof quickItems[0]) => {
    triggerMedium();
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    try {
      await addTransaction({
        type: 'expense',
        amount: item.amt,
        category: item.cat,
        merchant: item.name,
        paymentMethod: item.mode,
        source: 'Manual',
        date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
        time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
      });
      triggerSuccess();
    } catch {}
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              triggerLight();
              refreshData();
            }}
            tintColor={COLORS.rubyRed}
            colors={[COLORS.rubyRed, COLORS.subsurfaceWine]}
            progressBackgroundColor={COLORS.charcoalCard}
          />
        }
      >
        {/* Top Telemetry Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.appHeaderTitle, { fontSize: typography.heroSub }]}>
              GALAXY COMMAND
            </Text>
            <Text style={[styles.appHeaderSub, { fontSize: typography.microMeta }]}>
              1080x2340 FHD+ Active Telemetry
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              triggerLight();
              router.push('/(app)/settings');
            }}
            style={styles.systemStatusBadge}
          >
            <View style={styles.livePulse} />
            <Text style={[styles.statusText, { fontSize: typography.caption }]}>
              ONLINE
            </Text>
          </TouchableOpacity>
        </View>

        {/* SECTION 1: HERO BALANCE CARD */}
        <View style={styles.sectionSpacer}>
          <BalanceCard
            netAvailableMoney={overview.netAvailableMoney}
            totalBankBalance={overview.totalBankBalance}
            cashBalance={overview.cashBalance}
            onAddTransaction={() => router.push('/(app)/transactions')}
            onOpenVaults={() => router.push('/(app)/banks')}
            onOpenCash={() => router.push('/(app)/banks')}
          />
        </View>

        {/* SECTION 2: ONE-TAP QUICK LOG ACCELERATORS */}
        <View style={styles.sectionSpacer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { fontSize: typography.cardHeader }]}>
              ONE-TAP ACCELERATORS
            </Text>
            <Text style={[styles.sectionMeta, { fontSize: typography.microMeta }]}>
              Rapid Entry
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.acceleratorsRow}
          >
            {quickItems.map((item, idx) => (
              <PressableScale
                key={idx}
                activeScale={0.97}
                onPress={() => handleQuickLog(item)}
                style={styles.quickCard}
              >
                <Text style={[styles.quickName, { fontSize: typography.microMeta }]}>
                  {item.name}
                </Text>
                <Text style={[styles.quickAmount, { fontSize: typography.bodyRegular }]}>
                  ₹{item.amt}
                </Text>
                <View style={styles.quickPill}>
                  <Text style={[styles.quickPillText, { fontSize: typography.caption }]}>
                    {item.mode}
                  </Text>
                </View>
              </PressableScale>
            ))}
          </ScrollView>
        </View>

        {/* SECTION 3: CONNECTED BANK VAULTS PREVIEW */}
        <View style={styles.sectionSpacer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { fontSize: typography.cardHeader }]}>
              CONNECTED VAULTS ({banks.length})
            </Text>
            <TouchableOpacity
              onPress={() => {
                triggerLight();
                router.push('/(app)/banks');
              }}
            >
              <Text style={[styles.viewAllText, { fontSize: typography.microMeta }]}>
                View All →
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.vaultsGrid}>
            {banks.slice(0, 3).map((bank) => (
              <PressableScale
                key={bank.id}
                activeScale={0.98}
                onPress={() => {
                  triggerLight();
                  router.push('/(app)/banks');
                }}
                style={styles.vaultMiniCard}
              >
                <View style={styles.vaultHeader}>
                  <View
                    style={[
                      styles.vaultColorDot,
                      { backgroundColor: bank.planetColor || COLORS.rubyRed },
                    ]}
                  />
                  <Text
                    style={[styles.vaultName, { fontSize: typography.microMeta }]}
                    numberOfLines={1}
                  >
                    {bank.bankName}
                  </Text>
                </View>
                <Text style={[styles.vaultBalance, { fontSize: typography.cardHeader }]}>
                  ₹{(bank.balance || 0).toLocaleString('en-IN')}
                </Text>
                <Text style={[styles.vaultType, { fontSize: typography.caption }]}>
                  {bank.accountType}
                </Text>
              </PressableScale>
            ))}
          </View>
        </View>

        {/* SECTION 4: RECENT TRANSACTIONS */}
        <View style={styles.sectionSpacer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { fontSize: typography.cardHeader }]}>
              RECENT OUTFLOW TELEMETRY
            </Text>
            <TouchableOpacity
              onPress={() => {
                triggerLight();
                router.push('/(app)/transactions');
              }}
            >
              <Text style={[styles.viewAllText, { fontSize: typography.microMeta }]}>
                Full Ledger →
              </Text>
            </TouchableOpacity>
          </View>

          <TransactionList
            transactions={transactions.slice(0, 6)}
            onSelectTransaction={() => {}}
            emptyMessage="Zero transaction entries recorded today."
          />
        </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  appHeaderTitle: {
    color: COLORS.primaryText,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  appHeaderSub: {
    color: COLORS.secondaryText,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  systemStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.cardSurface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primaryAccent,
  },
  statusText: {
    color: COLORS.primaryText,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  sectionSpacer: {
    marginBottom: SPACING.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.primaryText,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
  sectionMeta: {
    color: COLORS.secondaryText,
  },
  viewAllText: {
    color: COLORS.primaryAccent,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  acceleratorsRow: {
    gap: SPACING.sm,
    paddingRight: SPACING.md,
  },
  quickCard: {
    backgroundColor: COLORS.cardSurface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    width: 124,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
  },
  quickName: {
    color: COLORS.secondaryText,
    fontWeight: '600',
    marginBottom: 4,
  },
  quickAmount: {
    color: COLORS.primaryText,
    fontWeight: '800',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  quickPill: {
    backgroundColor: COLORS.canvas,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
    alignSelf: 'flex-start',
  },
  quickPillText: {
    color: COLORS.secondaryText,
    fontWeight: '600',
  },
  vaultsGrid: {
    gap: SPACING.sm,
  },
  vaultMiniCard: {
    backgroundColor: COLORS.cardSurface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
  },
  vaultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  vaultColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  vaultName: {
    color: COLORS.secondaryText,
    fontWeight: '700',
    flex: 1,
  },
  vaultBalance: {
    color: COLORS.primaryText,
    fontWeight: '800',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  vaultType: {
    color: COLORS.secondaryText,
    fontFamily: 'monospace',
  },
});
