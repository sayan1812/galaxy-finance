import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/ThemeContext';
import { radius, spacing } from '../theme';

interface MicroReactionProps {
  type: string | null;
  onDismiss?: () => void;
}

const { width } = Dimensions.get('window');

export const MicroReaction: React.FC<MicroReactionProps> = ({ type, onDismiss }) => {
  const { colors, reduceMotion } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (!type) return;

    if (reduceMotion) {
      // Immediate fade
      Animated.sequence([
        Animated.timing(opacityAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.delay(1800),
        Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true })
      ]).start(() => onDismiss?.());
      return;
    }

    scaleAnim.setValue(0.3);
    opacityAnim.setValue(0);
    translateYAnim.setValue(25);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        friction: 6,
        useNativeDriver: true
      })
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(translateYAnim, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true
        })
      ]).start(() => onDismiss?.());
    }, 2200);

    return () => clearTimeout(timer);
  }, [type, reduceMotion]);

  if (!type) return null;

  const getReactionConfig = () => {
    switch (type) {
      case 'transaction_added':
        return {
          icon: 'checkmark-circle' as const,
          color: colors.income,
          label: 'Transaction Logged',
          sub: 'Balances dynamically updated'
        };
      case 'transaction_deleted':
        return {
          icon: 'trash-outline' as const,
          color: colors.expense,
          label: 'Transaction Removed',
          sub: 'Ledger adjusted safely'
        };
      case 'bank_added':
        return {
          icon: 'planet-outline' as const,
          color: colors.primary,
          label: 'New Bank Vault Added',
          sub: 'Orbital celestial body formed'
        };
      case 'balance_adjusted':
        return {
          icon: 'sync-circle-outline' as const,
          color: colors.secondary,
          label: 'Balance Reconciled',
          sub: 'Audit adjustment recorded'
        };
      case 'budget_saved':
        return {
          icon: 'pie-chart-outline' as const,
          color: colors.accent,
          label: 'Budget Configured',
          sub: 'Tracking spending thresholds'
        };
      case 'sync_completed':
        return {
          icon: 'cloud-done-outline' as const,
          color: colors.income,
          label: 'Offline Synced',
          sub: 'All offline records committed'
        };
      default:
        return {
          icon: 'sparkles' as const,
          color: colors.primary,
          label: 'Action Completed',
          sub: 'Saved successfully'
        };
    }
  };

  const config = getReactionConfig();

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim }
          ],
          opacity: opacityAnim
        }
      ]}
    >
      <View
        style={[
          styles.pill,
          {
            backgroundColor: colors.card,
            borderColor: config.color,
            shadowColor: config.color
          }
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: `${config.color}20` }]}>
          <Ionicons name={config.icon} size={22} color={config.color} />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{config.label}</Text>
          <Text style={[styles.sub, { color: colors.textMuted }]}>{config.sub}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    maxWidth: width - 40
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm
  },
  textWrap: {
    flexShrink: 1
  },
  title: {
    fontSize: 13,
    fontWeight: '700'
  },
  sub: {
    fontSize: 11
  }
});
