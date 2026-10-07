import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/layout';
import { useResponsive } from '../../hooks/useResponsive';
import { useHaptics } from '../../hooks/useHaptics';
import { useFinance } from '../../store/FinanceContext';
import { TransactionList } from '../../components/transactions/TransactionList';
import type { PaymentMethod, TransactionType } from '../../types';

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { typography } = useResponsive();
  const { triggerLight, triggerMedium, triggerSuccess } = useHaptics();

  const {
    transactions,
    isRefreshing,
    refreshData,
    addTransaction,
    deleteTransaction,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Transaction State
  const [newAmount, setNewAmount] = useState('');
  const [newMerchant, setNewMerchant] = useState('');
  const [newCategory, setNewCategory] = useState('Food & Restaurant');
  const [newMethod, setNewMethod] = useState<PaymentMethod>('UPI');
  const [newType, setNewType] = useState<TransactionType>('expense');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (filterType === 'EXPENSE' && tx.type !== 'expense' && tx.type !== ('EXPENSE' as any)) return false;
      if (filterType === 'INCOME' && tx.type !== 'income' && tx.type !== ('INCOME' as any)) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesMerchant = tx.merchant?.toLowerCase().includes(q);
        const matchesCategory = tx.category?.toLowerCase().includes(q);
        const matchesDesc = tx.description?.toLowerCase().includes(q);
        if (!matchesMerchant && !matchesCategory && !matchesDesc) return false;
      }

      return true;
    });
  }, [transactions, filterType, searchQuery]);

  const handleCreateTransaction = async () => {
    const amt = parseFloat(newAmount);
    if (!amt || isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    triggerMedium();
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    try {
      await addTransaction({
        amount: amt,
        type: newType,
        category: newCategory,
        merchant: newMerchant.trim() || newCategory,
        paymentMethod: newMethod,
        source: 'Manual',
        date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
        time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
      });
      triggerSuccess();
      setIsAddModalOpen(false);
      setNewAmount('');
      setNewMerchant('');
    } catch {}
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.screenHeader,
          { paddingTop: Math.max(insets.top + 10, 20) },
        ]}
      >
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.headerTitle, { fontSize: typography.heroSub }]}>
              TRANSACTION LEDGER
            </Text>
            <Text style={[styles.headerSub, { fontSize: typography.microMeta }]}>
              {filteredTransactions.length} Logged Entries
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              triggerLight();
              setIsAddModalOpen(true);
            }}
            style={styles.addButton}
          >
            <Text style={[styles.addButtonText, { fontSize: typography.bodySmall }]}>
              + Record
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, { fontSize: typography.bodySmall }]}
            placeholder="Search merchants, categories..."
            placeholderTextColor={COLORS.slateDark}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['ALL', 'EXPENSE', 'INCOME'] as const).map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={() => {
                triggerLight();
                setFilterType(mode);
              }}
              style={[
                styles.filterPill,
                filterType === mode && styles.filterPillActive,
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  filterType === mode && styles.filterPillTextActive,
                  { fontSize: typography.microMeta },
                ]}
              >
                {mode === 'ALL' ? 'All Entries' : mode === 'EXPENSE' ? 'Outflows' : 'Inflows'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Transaction List with Native FlatList, Safe Insets, and RefreshControl */}
      <View style={styles.listWrapper}>
        <TransactionList
          transactions={filteredTransactions}
          isRefreshing={isRefreshing}
          onRefresh={refreshData}
          onDeleteTransaction={(id) => deleteTransaction(id)}
          emptyMessage="No entries match your search criteria."
        />
      </View>

      {/* Record Transaction Modal */}
      <Modal
        visible={isAddModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { paddingBottom: Math.max(insets.bottom + 20, 24) },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { fontSize: typography.cardHeader }]}>
                RECORD TRANSACTION
              </Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Type Toggle: Expense vs Income */}
            <View style={styles.typeToggleRow}>
              <TouchableOpacity
                onPress={() => setNewType('expense')}
                style={[
                  styles.typeButton,
                  newType === 'expense' && styles.typeButtonActiveExpense,
                ]}
              >
                <Text style={styles.typeButtonText}>Outflow (-)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setNewType('income')}
                style={[
                  styles.typeButton,
                  newType === 'income' && styles.typeButtonActiveIncome,
                ]}
              >
                <Text style={styles.typeButtonText}>Inflow (+)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { fontSize: typography.microMeta }]}>
                AMOUNT (₹)
              </Text>
              <TextInput
                style={[styles.modalInput, styles.amountInput, { fontSize: typography.heroSub }]}
                placeholder="0.00"
                placeholderTextColor={COLORS.slateDark}
                value={newAmount}
                onChangeText={setNewAmount}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { fontSize: typography.microMeta }]}>
                MERCHANT / PAYEE
              </Text>
              <TextInput
                style={[styles.modalInput, { fontSize: typography.bodyRegular }]}
                placeholder="Swiggy, Amazon, Metro..."
                placeholderTextColor={COLORS.slateDark}
                value={newMerchant}
                onChangeText={setNewMerchant}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { fontSize: typography.microMeta }]}>
                PAYMENT CHANNEL
              </Text>
              <View style={styles.channelRow}>
                {(['UPI', 'Cash', 'Credit Card', 'Debit Card'] as PaymentMethod[]).map((method) => (
                  <TouchableOpacity
                    key={method}
                    onPress={() => setNewMethod(method)}
                    style={[
                      styles.channelPill,
                      newMethod === method && styles.channelPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.channelText,
                        newMethod === method && styles.channelTextActive,
                        { fontSize: typography.caption },
                      ]}
                    >
                      {method}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCreateTransaction}
              style={styles.modalSubmitButton}
            >
              <Text style={[styles.modalSubmitText, { fontSize: typography.bodyRegular }]}>
                Log to Galaxy Ledger
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },
  screenHeader: {
    paddingHorizontal: SPACING.screenPadding,
    backgroundColor: COLORS.canvas,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSand,
    paddingBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    color: COLORS.primaryText,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  headerSub: {
    color: COLORS.secondaryText,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: COLORS.primaryAccent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FAF7F3',
    fontWeight: '700',
  },
  searchContainer: {
    marginBottom: SPACING.sm,
  },
  searchInput: {
    backgroundColor: COLORS.cardSurface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
    color: COLORS.primaryText,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 44,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardSurface,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
    minHeight: 36,
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: COLORS.primaryAccent,
    borderColor: COLORS.primaryAccent,
  },
  filterPillText: {
    color: COLORS.secondaryText,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FAF7F3',
    fontWeight: '700',
  },
  listWrapper: {
    flex: 1,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 38, 33, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.cardSurface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderTopWidth: 1,
    borderColor: COLORS.borderSand,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    color: COLORS.primaryText,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  modalCloseText: {
    color: COLORS.secondaryText,
    fontSize: 18,
    padding: 4,
  },
  typeToggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING.md,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.canvas,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  typeButtonActiveExpense: {
    backgroundColor: 'rgba(255, 177, 177, 0.35)',
    borderWidth: 1,
    borderColor: COLORS.errorUrgent,
  },
  typeButtonActiveIncome: {
    backgroundColor: 'rgba(217, 162, 153, 0.25)',
    borderWidth: 1,
    borderColor: COLORS.primaryAccent,
  },
  typeButtonText: {
    color: COLORS.primaryText,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    color: COLORS.secondaryText,
    fontFamily: 'monospace',
    fontWeight: '700',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: COLORS.canvas,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
    color: COLORS.primaryText,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 48,
  },
  amountInput: {
    fontWeight: '800',
    fontFamily: 'monospace',
    color: COLORS.errorUrgent,
  },
  channelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  channelPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.canvas,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
    minHeight: 40,
    justifyContent: 'center',
  },
  channelPillActive: {
    backgroundColor: COLORS.primaryAccent,
    borderColor: COLORS.primaryAccent,
  },
  channelText: {
    color: COLORS.secondaryText,
    fontWeight: '600',
  },
  channelTextActive: {
    color: '#FAF7F3',
    fontWeight: '700',
  },
  modalSubmitButton: {
    backgroundColor: COLORS.primaryAccent,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  modalSubmitText: {
    color: '#FAF7F3',
    fontWeight: '800',
  },
});
