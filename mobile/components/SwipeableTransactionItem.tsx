import React, { useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  PanResponder,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types';
import { formatCurrency, formatTime, CATEGORIES } from '../utils/formatters';
import { useTheme } from '../store/ThemeContext';
import { radius, spacing, typography } from '../theme';

interface SwipeableTransactionItemProps {
  transaction: Transaction;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onPress?: (tx: Transaction) => void;
}

const ACTION_THRESHOLD = 70;

export const SwipeableTransactionItem: React.FC<SwipeableTransactionItemProps> = ({
  transaction,
  onEdit,
  onDelete,
  onPress
}) => {
  const { colors } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10,
      onPanResponderMove: (_, gesture) => {
        // Limit swipe range to [-90, 90]
        if (gesture.dx > -90 && gesture.dx < 90) {
          translateX.setValue(gesture.dx);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -ACTION_THRESHOLD) {
          // Swiped left -> Trigger Delete
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
          onDelete(transaction);
        } else if (gesture.dx > ACTION_THRESHOLD) {
          // Swiped right -> Trigger Edit
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
          onEdit(transaction);
        } else {
          // Reset
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      }
    })
  ).current;

  const isIncome = transaction.type === 'income';
  const categoryInfo = CATEGORIES.find(c => c.name === transaction.category) || {
    icon: 'cube-outline',
    color: colors.primary
  };

  return (
    <View style={styles.wrapper}>
      {/* Background action buttons revealed by swipe */}
      <View style={styles.backgroundActions}>
        {/* Left background: Edit */}
        <TouchableOpacity
          style={[styles.leftAction, { backgroundColor: colors.primary }]}
          onPress={() => onEdit(transaction)}
        >
          <Ionicons name="pencil" size={20} color="#ffffff" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        {/* Right background: Delete */}
        <TouchableOpacity
          style={[styles.rightAction, { backgroundColor: colors.expense }]}
          onPress={() => onDelete(transaction)}
        >
          <Ionicons name="trash-outline" size={20} color="#ffffff" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Main card */}
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: transaction.isPendingSync ? colors.warning : colors.borderSubtle,
            transform: [{ translateX }]
          }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.innerTouch}
          onPress={() => onPress?.(transaction)}
          activeOpacity={0.8}
        >
          {/* Category Icon */}
          <View style={[styles.iconWrap, { backgroundColor: `${categoryInfo.color}20` }]}>
            <Ionicons name={categoryInfo.icon as any} size={22} color={categoryInfo.color} />
          </View>

          {/* Details */}
          <View style={styles.details}>
            <View style={styles.topRow}>
              <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
                {transaction.merchant || transaction.category}
              </Text>
              <Text
                style={[
                  styles.amount,
                  { color: isIncome ? colors.income : colors.expense }
                ]}
              >
                {isIncome ? '+ ' : '− '}
                {formatCurrency(transaction.amount)}
              </Text>
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.tagWrap}>
                <Text style={[styles.subText, { color: colors.textMuted }]}>
                  {transaction.paymentMethod}
                  {transaction.bankNickname || transaction.bankName ? ` · ${transaction.bankNickname || transaction.bankName}` : ''}
                </Text>
                {transaction.isPendingSync && (
                  <View style={[styles.pendingPill, { backgroundColor: `${colors.warning}25` }]}>
                    <Text style={[styles.pendingText, { color: colors.warning }]}>Pending Sync</Text>
                  </View>
                )}
              </View>

              <Text style={[styles.timeText, { color: colors.textMuted }]}>
                {formatTime(transaction.time)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.lg,
    marginVertical: 4,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative'
  },
  backgroundActions: {
    ...(StyleSheet.absoluteFill as any),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  leftAction: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  rightAction: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2
  },
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md
  },
  innerTouch: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md
  },
  details: {
    flex: 1
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3
  },
  title: {
    ...typography.bodyBold,
    fontSize: 15,
    flexShrink: 1,
    marginRight: spacing.sm
  },
  amount: {
    ...typography.bodyBold,
    fontSize: 15
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1
  },
  subText: {
    ...typography.caption
  },
  pendingPill: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4
  },
  pendingText: {
    fontSize: 9,
    fontWeight: '700'
  },
  timeText: {
    ...typography.caption
  }
});
