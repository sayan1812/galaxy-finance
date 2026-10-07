import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/layout';
import { useResponsive } from '../../hooks/useResponsive';
import { useHaptics } from '../../hooks/useHaptics';
import { PressableScale } from '../common/PressableScale';

export interface BalanceCardProps {
  netAvailableMoney: number;
  totalBankBalance: number;
  cashBalance: number;
  currencySymbol?: string;
  onAddTransaction?: () => void;
  onOpenVaults?: () => void;
  onOpenCash?: () => void;
}

/**
 * GALAXY FINANCE — NATIVE BALANCE CARD (1080x2340 FHD+ OPTIMIZED)
 * Hero metric (28–34pt bold), card headers (16–18pt), micro-meta (11–12pt)
 * Micro-scale touch compression (1 -> 0.985) and haptic response.
 */
export const BalanceCard: React.FC<BalanceCardProps> = ({
  netAvailableMoney = 0,
  totalBankBalance = 0,
  cashBalance = 0,
  currencySymbol = '₹',
  onAddTransaction,
  onOpenVaults,
  onOpenCash,
}) => {
  const { typography } = useResponsive();
  const { triggerMedium, triggerLight } = useHaptics();

  const formatAmount = (val: number) => {
    return `${currencySymbol}${val.toLocaleString('en-IN')}`;
  };

  return (
    <PressableScale
      activeScale={0.985}
      style={styles.cardContainer}
      onPress={() => {
        triggerLight();
      }}
    >
      {/* Ambient wine backdrop aura */}
      <View style={styles.ambientAura} />

      {/* Header telemetry info */}
      <View style={styles.cardHeader}>
        <View style={styles.badgeRow}>
          <View style={styles.liveIndicator} />
          <Text style={[styles.subheadText, { fontSize: typography.microMeta }]}>
            TOTAL LIQUID CAPITAL
          </Text>
        </View>
        <Text style={[styles.currencyTag, { fontSize: typography.caption }]}>
          INR TELEMETRY
        </Text>
      </View>

      {/* Primary Hero Balance Metric (28-34pt bold) */}
      <View style={styles.balanceContainer}>
        <Text
          style={[
            styles.heroMetric,
            { fontSize: typography.heroBalance },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatAmount(netAvailableMoney)}
        </Text>
        <Text style={[styles.heroDescription, { fontSize: typography.microMeta }]}>
          Net Liquidity across connected bank accounts & cash reserves
        </Text>
      </View>

      {/* Breakdown Row: Bank Vaults vs Physical Cash */}
      <View style={styles.breakdownRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            triggerLight();
            onOpenVaults?.();
          }}
          style={styles.breakdownCol}
        >
          <View style={styles.statLabelRow}>
            <View style={[styles.nodeDot, { backgroundColor: COLORS.rubyRed }]} />
            <Text style={[styles.statLabel, { fontSize: typography.microMeta }]}>
              Bank Vaults
            </Text>
          </View>
          <Text style={[styles.statValue, { fontSize: typography.cardHeader }]}>
            {formatAmount(totalBankBalance)}
          </Text>
        </TouchableOpacity>

        <View style={styles.verticalDivider} />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            triggerLight();
            onOpenCash?.();
          }}
          style={styles.breakdownCol}
        >
          <View style={styles.statLabelRow}>
            <View style={[styles.nodeDot, { backgroundColor: COLORS.coolSteelSlate }]} />
            <Text style={[styles.statLabel, { fontSize: typography.microMeta }]}>
              Physical Cash
            </Text>
          </View>
          <Text style={[styles.statValue, { fontSize: typography.cardHeader }]}>
            {formatAmount(cashBalance)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Accelerator Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            triggerMedium();
            onAddTransaction?.();
          }}
          style={styles.primaryActionButton}
        >
          <Text style={[styles.primaryActionText, { fontSize: typography.bodySmall }]}>
            + Log Outflow
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            triggerLight();
            onOpenVaults?.();
          }}
          style={styles.secondaryActionButton}
        >
          <Text style={[styles.secondaryActionText, { fontSize: typography.bodySmall }]}>
            Vaults
          </Text>
        </TouchableOpacity>
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.cardSurface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#2D2621',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  ambientAura: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.secondaryAccent,
    opacity: 0.45,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primaryAccent,
  },
  subheadText: {
    color: COLORS.secondaryText,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  currencyTag: {
    color: COLORS.secondaryText,
    fontFamily: 'monospace',
    fontWeight: '600',
    backgroundColor: 'rgba(220, 197, 178, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  balanceContainer: {
    marginBottom: SPACING.xl,
  },
  heroMetric: {
    color: COLORS.primaryText,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontFamily: 'monospace',
  },
  heroDescription: {
    color: COLORS.secondaryText,
    marginTop: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.canvas,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
    marginBottom: SPACING.lg,
  },
  breakdownCol: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  nodeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statLabel: {
    color: COLORS.secondaryText,
  },
  statValue: {
    color: COLORS.primaryText,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  verticalDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.borderSand,
    marginHorizontal: SPACING.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  primaryActionButton: {
    flex: 2,
    minHeight: 44,
    backgroundColor: COLORS.primaryAccent,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryAccent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryActionText: {
    color: '#FAF7F3',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryActionButton: {
    flex: 1,
    minHeight: 44,
    backgroundColor: COLORS.canvas,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    color: COLORS.primaryText,
    fontWeight: '600',
  },
});
