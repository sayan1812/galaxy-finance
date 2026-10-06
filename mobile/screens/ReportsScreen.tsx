import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/ThemeContext';
import { useFinance } from '../store/FinanceContext';
import { api } from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { formatCurrency, CATEGORIES } from '../utils/formatters';
import { radius, spacing, typography } from '../theme';

const RANGES = [
  { id: 'today', label: 'Today' },
  { id: 'this_week', label: 'Weekly' },
  { id: 'this_month', label: 'Monthly' },
  { id: 'this_year', label: 'Yearly' }
];

export const ReportsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { overview } = useFinance();
  const [selectedRange, setSelectedRange] = useState('this_month');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    async function loadReport() {
      setIsLoading(true);
      try {
        const data = await api.getReports(selectedRange);
        setReportData(data);
      } catch (err) {
        console.warn('[Reports] Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, [selectedRange]);

  const summary = reportData?.summary || {
    income: overview.totalIncome,
    expense: overview.totalExpense,
    net: overview.totalIncome - overview.totalExpense
  };

  const categories = reportData?.categoryBreakdown || [];
  const paymentMethods = reportData?.paymentMethodBreakdown || [];
  const highestExpense = reportData?.highestExpense;

  const totalExpense = summary.expense || 1;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.subTitle, { color: colors.textMuted }]}>FINANCIAL METRICS</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Reports & Analytics</Text>
        </View>

        {/* Range Selector Pills */}
        <View style={[styles.rangePillsWrap, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
          {RANGES.map(r => {
            const isSelected = selectedRange === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                style={[
                  styles.rangePill,
                  isSelected && { backgroundColor: colors.primary }
                ]}
                onPress={() => setSelectedRange(r.id)}
              >
                <Text
                  style={[
                    styles.rangePillText,
                    { color: isSelected ? '#ffffff' : colors.textMuted, fontWeight: isSelected ? '700' : '500' }
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Overview Summary Card */}
            <GlassCard borderGlow glowColor={colors.primaryGlow} style={styles.summaryCard}>
              <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>NET CASH FLOW</Text>
              <Text
                style={[
                  styles.netAmount,
                  { color: summary.net >= 0 ? colors.income : colors.expense }
                ]}
              >
                {summary.net >= 0 ? '+' : ''}{formatCurrency(summary.net)}
              </Text>

              <View style={[styles.summaryRow, { borderTopColor: colors.borderSubtle }]}>
                <View style={styles.summaryCol}>
                  <Text style={[styles.colLabel, { color: colors.textMuted }]}>Total Income</Text>
                  <Text style={[styles.colValue, { color: colors.income }]}>
                    +{formatCurrency(summary.income)}
                  </Text>
                </View>

                <View style={[styles.dividerVertical, { backgroundColor: colors.borderSubtle }]} />

                <View style={styles.summaryCol}>
                  <Text style={[styles.colLabel, { color: colors.textMuted }]}>Total Expense</Text>
                  <Text style={[styles.colValue, { color: colors.expense }]}>
                    −{formatCurrency(summary.expense)}
                  </Text>
                </View>
              </View>
            </GlassCard>

            {/* Highest Expense Highlight */}
            {highestExpense && (
              <GlassCard style={styles.highestExpenseCard}>
                <View style={styles.highlightHeader}>
                  <Ionicons name="flame" size={18} color={colors.expense} style={{ marginRight: 6 }} />
                  <Text style={[styles.highlightTitle, { color: colors.expense }]}>HIGHEST SINGLE EXPENSE</Text>
                </View>
                <View style={styles.highlightContent}>
                  <View>
                    <Text style={[styles.highestMerchant, { color: colors.textPrimary }]}>
                      {highestExpense.merchant || highestExpense.category}
                    </Text>
                    <Text style={[styles.highestSub, { color: colors.textMuted }]}>
                      {highestExpense.category} · {highestExpense.date}
                    </Text>
                  </View>
                  <Text style={[styles.highestAmount, { color: colors.expense }]}>
                    {formatCurrency(highestExpense.amount)}
                  </Text>
                </View>
              </GlassCard>
            )}

            {/* Category Breakdown */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Category Breakdown</Text>
            <GlassCard style={styles.breakdownCard}>
              {categories.map((cat: any, idx: number) => {
                const percent = Math.min(Math.round((cat.amount / totalExpense) * 100), 100);
                const catDef = CATEGORIES.find(c => c.name === cat.category) || {
                  color: colors.primary,
                  icon: 'cube-outline'
                };

                return (
                  <View key={idx} style={styles.categoryItem}>
                    <View style={styles.catTopRow}>
                      <View style={styles.catNameWrap}>
                        <View style={[styles.catDot, { backgroundColor: catDef.color }]} />
                        <Text style={[styles.catName, { color: colors.textPrimary }]}>
                          {cat.category}
                        </Text>
                      </View>
                      <View style={styles.catAmtWrap}>
                        <Text style={[styles.catAmt, { color: colors.textPrimary }]}>
                          {formatCurrency(cat.amount)}
                        </Text>
                        <Text style={[styles.catPct, { color: colors.textMuted }]}>
                          {percent}%
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={[styles.progressBarTrack, { backgroundColor: colors.cardSecondary }]}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${percent}%`, backgroundColor: catDef.color }
                        ]}
                      />
                    </View>
                  </View>
                );
              })}

              {categories.length === 0 && (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  No expense records found for this period.
                </Text>
              )}
            </GlassCard>

            {/* Payment Method Breakdown */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Payment Method Share</Text>
            <GlassCard style={styles.breakdownCard}>
              {paymentMethods.map((pm: any, idx: number) => {
                const percent = Math.min(Math.round((pm.amount / totalExpense) * 100), 100);
                return (
                  <View key={idx} style={styles.categoryItem}>
                    <View style={styles.catTopRow}>
                      <Text style={[styles.catName, { color: colors.textPrimary }]}>
                        {pm.payment_method || pm.method}
                      </Text>
                      <View style={styles.catAmtWrap}>
                        <Text style={[styles.catAmt, { color: colors.textPrimary }]}>
                          {formatCurrency(pm.amount)}
                        </Text>
                        <Text style={[styles.catPct, { color: colors.textMuted }]}>
                          {percent}%
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.progressBarTrack, { backgroundColor: colors.cardSecondary }]}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${percent}%`, backgroundColor: colors.secondary }
                        ]}
                      />
                    </View>
                  </View>
                );
              })}

              {paymentMethods.length === 0 && (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  No payment data available.
                </Text>
              )}
            </GlassCard>
          </>
        )}
      </ScrollView>
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
  rangePillsWrap: {
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 3,
    marginBottom: spacing.lg
  },
  rangePill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.sm
  },
  rangePillText: {
    fontSize: 12
  },
  summaryCard: {
    marginBottom: spacing.md
  },
  cardTitle: {
    ...typography.micro,
    fontWeight: '700',
    letterSpacing: 1
  },
  netAmount: {
    ...typography.hero,
    fontSize: 32,
    marginVertical: 4
  },
  summaryRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: spacing.md,
    marginTop: spacing.sm
  },
  summaryCol: {
    flex: 1
  },
  colLabel: {
    ...typography.caption
  },
  colValue: {
    ...typography.bodyBold,
    fontSize: 15,
    marginTop: 2
  },
  dividerVertical: {
    width: 1,
    height: 32,
    marginHorizontal: spacing.md
  },
  highestExpenseCard: {
    marginBottom: spacing.md,
    borderColor: 'rgba(239, 68, 68, 0.3)'
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  highlightTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  highlightContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  highestMerchant: {
    ...typography.bodyBold,
    fontSize: 15
  },
  highestSub: {
    ...typography.caption,
    marginTop: 2
  },
  highestAmount: {
    ...typography.h3,
    fontSize: 18
  },
  sectionTitle: {
    ...typography.h3,
    marginTop: spacing.md,
    marginBottom: spacing.sm
  },
  breakdownCard: {
    marginBottom: spacing.md
  },
  categoryItem: {
    marginBottom: spacing.md
  },
  catTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  catNameWrap: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8
  },
  catName: {
    ...typography.bodyBold,
    fontSize: 13
  },
  catAmtWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  catAmt: {
    ...typography.bodyBold,
    fontSize: 13
  },
  catPct: {
    ...typography.caption
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3
  },
  emptyText: {
    ...typography.caption,
    textAlign: 'center',
    paddingVertical: spacing.md
  }
});
