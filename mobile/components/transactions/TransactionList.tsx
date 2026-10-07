import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/layout';
import { useResponsive } from '../../hooks/useResponsive';
import { useHaptics } from '../../hooks/useHaptics';
import { PressableScale } from '../common/PressableScale';
import type { Transaction } from '../../types';

export interface TransactionListProps {
  transactions: Transaction[];
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onSelectTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  currencySymbol?: string;
  headerComponent?: React.ReactElement;
  emptyMessage?: string;
}

/**
 * GALAXY FINANCE — NATIVE TRANSACTION LIST (1080x2340 FHD+ OPTIMIZED)
 * Fluid FlatList scrolling, showsVerticalScrollIndicator={false},
 * native RefreshControl, tactile micro-compression, and swipe/action support.
 */
export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isRefreshing = false,
  onRefresh,
  onSelectTransaction,
  onDeleteTransaction,
  currencySymbol = '₹',
  headerComponent,
  emptyMessage = 'No transaction entries logged yet.',
}) => {
  const { typography } = useResponsive();
  const { triggerLight, triggerHeavy } = useHaptics();

  const renderItem: ListRenderItem<Transaction> = ({ item }) => {
    const isIncome = item.type === 'income' || item.type === ('INCOME' as any);
    const amountColor = isIncome ? COLORS.primaryAccent : COLORS.errorUrgent;
    const sign = isIncome ? '+' : '-';

    return (
      <PressableScale
        activeScale={0.985}
        style={styles.itemCard}
        onPress={() => {
          triggerLight();
          onSelectTransaction?.(item);
        }}
      >
        <View style={styles.itemLeft}>
          {/* Category Dot Node */}
          <View
            style={[
              styles.categoryNode,
              { backgroundColor: isIncome ? COLORS.primaryAccent : COLORS.errorUrgent },
            ]}
          />

          <View style={styles.itemMeta}>
            <Text
              style={[styles.itemTitle, { fontSize: typography.bodyRegular }]}
              numberOfLines={1}
            >
              {item.merchant || item.description || item.category || 'Transaction'}
            </Text>
            <View style={styles.subMetaRow}>
              <Text style={[styles.itemSub, { fontSize: typography.microMeta }]}>
                {item.category} • {item.paymentMethod || 'UPI'}
              </Text>
              <Text style={[styles.itemDate, { fontSize: typography.caption }]}>
                {item.date} {item.time ? `• ${item.time}` : ''}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.itemRight}>
          <Text
            style={[
              styles.amountText,
              { color: amountColor, fontSize: typography.cardHeader },
            ]}
          >
            {sign}{currencySymbol}{Math.abs(item.amount).toLocaleString('en-IN')}
          </Text>

          {item.bankName && (
            <Text style={[styles.bankTag, { fontSize: typography.caption }]}>
              {item.bankName}
            </Text>
          )}
        </View>
      </PressableScale>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyIcon, { fontSize: 32 }]}>✦</Text>
      <Text style={[styles.emptyText, { fontSize: typography.bodyRegular }]}>
        {emptyMessage}
      </Text>
      <Text style={[styles.emptySub, { fontSize: typography.microMeta }]}>
        Transactions recorded via Cash, UPI, or Bank Vaults will materialize here.
      </Text>
    </View>
  );

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id || item.localId || Math.random().toString()}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={headerComponent}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={styles.listContent}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              triggerLight();
              onRefresh();
            }}
            tintColor={COLORS.rubyRed}
            colors={[COLORS.rubyRed, COLORS.subsurfaceWine]}
            progressBackgroundColor={COLORS.charcoalCard}
          />
        ) : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 40,
  },
  itemCard: {
    backgroundColor: COLORS.cardSurface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.md,
  },
  categoryNode: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.md,
  },
  itemMeta: {
    flex: 1,
  },
  itemTitle: {
    color: COLORS.primaryText,
    fontWeight: '700',
    marginBottom: 2,
  },
  subMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  itemSub: {
    color: COLORS.secondaryText,
  },
  itemDate: {
    color: COLORS.secondaryText,
    fontFamily: 'monospace',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  bankTag: {
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    color: COLORS.secondaryText,
    marginBottom: 12,
  },
  emptyText: {
    color: COLORS.primaryText,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySub: {
    color: COLORS.secondaryText,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 260,
  },
});
