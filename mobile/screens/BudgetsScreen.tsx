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
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { formatCurrency, CATEGORIES } from '../utils/formatters';
import { radius, spacing, typography } from '../theme';
import { Budget } from '../types';

export const BudgetsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { budgets, addBudget, updateBudget, deleteBudget } = useFinance();

  const [showAddForm, setShowAddForm] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [amount, setAmount] = useState('');
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (isSubmitting) return;
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid monthly limit.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, {
          category,
          amount: parsed
        });
      } else {
        await addBudget({
          category,
          amount: parsed,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        });
      }
      setShowAddForm(false);
      setEditingBudget(null);
      setAmount('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not save budget.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (b: Budget) => {
    setEditingBudget(b);
    setCategory(b.category);
    setAmount(String(b.amount));
    setShowAddForm(true);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.subTitle, { color: colors.textMuted }]}>SPENDING DISCIPLINE</Text>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Monthly Budgets</Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              setEditingBudget(null);
              setAmount('');
              setShowAddForm(prev => !prev);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name={showAddForm ? 'close' : 'add'} size={20} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.addBtnText}>{showAddForm ? 'Cancel' : 'New Budget'}</Text>
          </TouchableOpacity>
        </View>

        {/* Add / Edit Budget Form */}
        {showAddForm && (
          <GlassCard style={styles.formCard}>
            <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
              {editingBudget ? 'Edit Budget' : 'Configure New Budget'}
            </Text>

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
                      size={14}
                      color={isSelected ? cat.color : colors.textSecondary}
                      style={{ marginRight: 4 }}
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

            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>MONTHLY LIMIT (₹)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
              placeholder="e.g. 5000"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <TouchableOpacity
              style={[styles.saveFormBtn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={isSubmitting}
            >
              <Text style={styles.saveFormBtnText}>{isSubmitting ? 'Saving...' : 'Set Budget Threshold'}</Text>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* Budget Cards List */}
        {budgets.map(b => {
          const spent = b.spent || 0;
          const ratio = Math.min(spent / b.amount, 1);
          const percent = Math.round((spent / b.amount) * 100);
          const isOver = spent > b.amount;
          const isNear = percent >= 80 && !isOver;

          let statusColor = colors.income;
          let statusLabel = 'On Track';
          if (isOver) {
            statusColor = colors.expense;
            statusLabel = 'Exceeded';
          } else if (isNear) {
            statusColor = colors.warning;
            statusLabel = '80% Warning';
          }

          return (
            <GlassCard key={b.id} style={styles.budgetCard}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={[styles.budgetCategory, { color: colors.textPrimary }]}>{b.category}</Text>
                  <Text style={[styles.budgetAmountSub, { color: colors.textMuted }]}>
                    {formatCurrency(spent)} of {formatCurrency(b.amount)}
                  </Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20`, borderColor: statusColor }]}>
                  <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel} ({percent}%)</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={[styles.progressTrack, { backgroundColor: colors.cardSecondary }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(percent, 100)}%`, backgroundColor: statusColor }
                  ]}
                />
              </View>

              {/* Footer actions */}
              <View style={[styles.cardFooter, { borderTopColor: colors.borderSubtle }]}>
                <Text style={[styles.remainingText, { color: colors.textMuted }]}>
                  {isOver
                    ? `Over by ${formatCurrency(spent - b.amount)}`
                    : `${formatCurrency(b.amount - spent)} remaining`}
                </Text>

                <View style={styles.actionBtns}>
                  <TouchableOpacity onPress={() => startEdit(b)} style={styles.iconBtn}>
                    <Ionicons name="pencil-outline" size={16} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setDeletingBudget(b)} style={styles.iconBtn}>
                    <Ionicons name="trash-outline" size={16} color={colors.expense} />
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          );
        })}

        {budgets.length === 0 && !showAddForm && (
          <View style={styles.emptyWrap}>
            <Ionicons name="pie-chart-outline" size={44} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Budgets Configured</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              Create monthly spending caps with automatic alerts at 80% and 100%.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={Boolean(deletingBudget)}
        title="Delete Budget?"
        message={`Delete the ${deletingBudget?.category} budget limit (${formatCurrency(deletingBudget?.amount)})?`}
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deletingBudget) {
            await deleteBudget(deletingBudget.id);
            setDeletingBudget(null);
          }
        }}
        onCancel={() => setDeletingBudget(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    padding: spacing.lg,
    paddingBottom: 80
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
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
  formCard: {
    marginBottom: spacing.lg
  },
  formTitle: {
    ...typography.h3,
    marginBottom: spacing.sm
  },
  fieldLabel: {
    ...typography.micro,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: spacing.sm,
    marginBottom: 4
  },
  chipsScroll: {
    gap: 8,
    paddingVertical: 4
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1
  },
  chipText: {
    fontSize: 12
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14
  },
  saveFormBtn: {
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.md
  },
  saveFormBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14
  },
  budgetCard: {
    marginBottom: spacing.md
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  budgetCategory: {
    ...typography.bodyBold,
    fontSize: 15
  },
  budgetAmountSub: {
    ...typography.caption,
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700'
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: spacing.xs
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: spacing.xs
  },
  remainingText: {
    ...typography.captionBold
  },
  actionBtns: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  iconBtn: {
    padding: 4
  },
  emptyWrap: {
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
