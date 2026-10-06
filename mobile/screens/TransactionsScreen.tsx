import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/ThemeContext';
import { SwipeableTransactionItem } from '../components/SwipeableTransactionItem';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { formatCurrency, getRelativeDay } from '../utils/formatters';
import { radius, spacing, typography } from '../theme';
import { Transaction } from '../types';

export const TransactionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { transactions, isRefreshing, refreshData, deleteTransaction } = useFinance();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const m = (t.merchant || '').toLowerCase();
        const c = (t.category || '').toLowerCase();
        const d = (t.description || '').toLowerCase();
        const p = (t.paymentMethod || '').toLowerCase();
        if (!m.includes(q) && !c.includes(q) && !d.includes(q) && !p.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, search, filterType]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.subTitle, { color: colors.textMuted }]}>FINANCIAL LEDGER</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Transactions</Text>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AddModal')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.borderSubtle }]}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search merchant, category, notes..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Type Filter Pills */}
      <View style={styles.filterRow}>
        {(['all', 'expense', 'income'] as const).map(f => {
          const isSelected = filterType === f;
          return (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterPill,
                {
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.borderSubtle
                }
              ]}
              onPress={() => setFilterType(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: isSelected ? '#ffffff' : colors.textMuted, fontWeight: isSelected ? '700' : '500' }
                ]}
              >
                {f === 'all' ? 'All Activity' : f === 'expense' ? 'Expenses' : 'Incomes'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Transaction List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id || item.localId || String(Math.random())}
        renderItem={({ item }) => (
          <SwipeableTransactionItem
            transaction={item}
            onEdit={target => navigation.navigate('AddModal', { editTransaction: target })}
            onDelete={target => setDeletingTx(target)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="search-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {search ? 'No transactions matching query' : 'No transactions found'}
            </Text>
          </View>
        }
      />

      {/* Confirmation Modal */}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginBottom: spacing.sm
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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1
  },
  searchInput: {
    flex: 1,
    fontSize: 14
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1
  },
  filterText: {
    fontSize: 12
  },
  listContent: {
    paddingBottom: 80
  },
  emptyWrap: {
    alignItems: 'center',
    padding: spacing.xxl
  },
  emptyText: {
    ...typography.caption,
    marginTop: spacing.sm
  }
});
