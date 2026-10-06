import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { SwipeableTransactionItem } from '../components/SwipeableTransactionItem';
import { formatCurrency, formatDate, getLocalDateString } from '../utils/formatters';
import { radius, spacing, typography } from '../theme';
import { Transaction } from '../types';

const { width } = Dimensions.get('window');
const CELL_SIZE = Math.floor((width - 48) / 7);

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { transactions, deleteTransaction } = useFinance();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(getLocalDateString(new Date()));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Navigate months
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(getLocalDateString(today));
  };

  // Build Calendar Matrix for this month
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
  // Convert to Monday = 0: (day + 6) % 7
  const startDayOffset = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: ({ dayNum: number; dateStr: string } | null)[] = [];
  for (let i = 0; i < startDayOffset; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ dayNum: d, dateStr: dStr });
  }

  // Transactions for selected date (timezone-safe)
  const selectedDayTransactions = transactions.filter(t => t.date && t.date.slice(0, 10) === selectedDateStr);
  const dayIncome = selectedDayTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const dayExpense = selectedDayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const dayNet = dayIncome - dayExpense;

  // Month summary
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthTransactions = transactions.filter(t => t.date && t.date.startsWith(monthPrefix));
  const monthTotalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthTotalExpense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Month Header with Navigation Controls */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.subTitle, { color: colors.textMuted }]}>TIMELINE CALENDAR</Text>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{monthName} {year}</Text>
          </View>

          <View style={styles.navRow}>
            <TouchableOpacity onPress={goToToday} style={[styles.todayBtn, { borderColor: colors.borderSubtle }]}>
              <Text style={[styles.todayText, { color: colors.primary }]}>Today</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={prevMonth} style={[styles.navArrow, { backgroundColor: colors.card }]}>
              <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity onPress={nextMonth} style={[styles.navArrow, { backgroundColor: colors.card }]}>
              <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Month Summary Bar */}
        <View style={[styles.monthSummaryBar, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Income: </Text>
            <Text style={[styles.summaryVal, { color: colors.income }]}>+{formatCurrency(monthTotalIncome)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Expense: </Text>
            <Text style={[styles.summaryVal, { color: colors.expense }]}>−{formatCurrency(monthTotalExpense)}</Text>
          </View>
        </View>

        {/* Weekday Labels */}
        <View style={styles.weekdaysRow}>
          {WEEKDAYS.map((wd, i) => (
            <View key={i} style={[styles.cell, { width: CELL_SIZE }]}>
              <Text style={[styles.weekdayText, { color: colors.textMuted }]}>{wd}</Text>
            </View>
          ))}
        </View>

        {/* Monthly Day Grid */}
        <View style={styles.grid}>
          {calendarDays.map((item, idx) => {
            if (!item) {
              return <View key={`empty_${idx}`} style={[styles.cell, { width: CELL_SIZE, height: CELL_SIZE + 8 }]} />;
            }

            const isSelected = item.dateStr === selectedDateStr;
            const isToday = item.dateStr === getLocalDateString(new Date());

            // Check if transactions exist for this day
            const dayTxs = transactions.filter(t => t.date === item.dateStr);
            const hasIncome = dayTxs.some(t => t.type === 'income');
            const hasExpense = dayTxs.some(t => t.type === 'expense');

            return (
              <TouchableOpacity
                key={item.dateStr}
                style={[
                  styles.dayCell,
                  { width: CELL_SIZE, height: CELL_SIZE + 8 },
                  isSelected && { backgroundColor: `${colors.primary}25`, borderColor: colors.primary },
                  isToday && !isSelected && { borderColor: colors.accent }
                ]}
                onPress={() => setSelectedDateStr(item.dateStr)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayNum,
                    { color: isSelected ? colors.primary : isToday ? colors.accent : colors.textPrimary },
                    (isSelected || isToday) && { fontWeight: '700' }
                  ]}
                >
                  {item.dayNum}
                </Text>

                {/* Dots indicator */}
                <View style={styles.dotsRow}>
                  {hasIncome && <View style={[styles.dot, { backgroundColor: colors.income }]} />}
                  {hasExpense && <View style={[styles.dot, { backgroundColor: colors.expense }]} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Date Summary & Transactions Card */}
        <GlassCard style={styles.dayDetailsCard}>
          <View style={styles.dayDetailsHeader}>
            <View>
              <Text style={[styles.selectedDayDate, { color: colors.textPrimary }]}>
                {formatDate(selectedDateStr)}
              </Text>
              <Text style={[styles.txCount, { color: colors.textMuted }]}>
                {selectedDayTransactions.length} transaction{selectedDayTransactions.length !== 1 ? 's' : ''}
              </Text>
            </View>

            <View style={styles.dayTotalsWrap}>
              <Text style={[styles.netTotal, { color: dayNet >= 0 ? colors.income : colors.expense }]}>
                {dayNet >= 0 ? '+' : ''}{formatCurrency(dayNet)}
              </Text>
              <Text style={[styles.inOutSub, { color: colors.textMuted }]}>
                In: {formatCurrency(dayIncome)} · Out: {formatCurrency(dayExpense)}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Selected Day Transaction Items */}
        {selectedDayTransactions.map(tx => (
          <SwipeableTransactionItem
            key={tx.id || tx.localId}
            transaction={tx}
            onEdit={target => navigation.navigate('AddModal', { editTransaction: target })}
            onDelete={async target => {
              await deleteTransaction(target.id);
            }}
          />
        ))}

        {selectedDayTransactions.length === 0 && (
          <View style={styles.emptyDayWrap}>
            <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyDayText, { color: colors.textMuted }]}>
              No activity recorded on this date.
            </Text>
            <TouchableOpacity
              style={[styles.addForDayBtn, { backgroundColor: `${colors.primary}20` }]}
              onPress={() => navigation.navigate('AddModal', { editTransaction: { date: selectedDateStr } })}
            >
              <Ionicons name="add" size={16} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.addForDayText, { color: colors.primary }]}>Add on this day</Text>
            </TouchableOpacity>
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
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  todayBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    marginRight: 4
  },
  todayText: {
    fontSize: 12,
    fontWeight: '700'
  },
  navArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center'
  },
  monthSummaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: 13
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '700'
  },
  summaryDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 6
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingVertical: 4
  },
  dayNum: {
    fontSize: 13
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    height: 5,
    marginTop: 3
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2
  },
  dayDetailsCard: {
    marginBottom: spacing.md,
    padding: spacing.md
  },
  dayDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  selectedDayDate: {
    ...typography.bodyBold,
    fontSize: 15
  },
  txCount: {
    ...typography.caption,
    marginTop: 2
  },
  dayTotalsWrap: {
    alignItems: 'flex-end'
  },
  netTotal: {
    ...typography.bodyBold,
    fontSize: 16
  },
  inOutSub: {
    ...typography.caption,
    marginTop: 2
  },
  emptyDayWrap: {
    alignItems: 'center',
    padding: spacing.xl
  },
  emptyDayText: {
    ...typography.caption,
    marginTop: spacing.xs,
    marginBottom: spacing.md
  },
  addForDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full
  },
  addForDayText: {
    fontSize: 13,
    fontWeight: '700'
  }
});
